"""
HL7 v2.x EHR Adapter

Parser and FHIR converter for legacy HL7 v2.x message integrations.
Supports ADT (Admit/Discharge/Transfer), ORU (Results), SIU (Scheduling).

HL7 v2.x Message Structure:
- Segments separated by carriage return (\\r)
- Fields separated by pipe (|)
- Components separated by caret (^)
- Repetitions separated by tilde (~)
- Subcomponents separated by ampersand (&)

Author: Jason M Jarmacz | Evolution Strategist | jason@ihep.app
Co-Author: Claude by Anthropic
"""

import logging
import re
import socket
import time
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Tuple

from .base_adapter import (
    AdapterConfig,
    BaseEHRAdapter,
    ConnectionStatus,
    FHIRResource,
    SyncResult,
)

logger = logging.getLogger(__name__)


class HL7MessageType(Enum):
    """Supported HL7 v2.x message types."""
    ADT_A01 = "ADT^A01"  # Patient Admit
    ADT_A02 = "ADT^A02"  # Patient Transfer
    ADT_A03 = "ADT^A03"  # Patient Discharge
    ADT_A04 = "ADT^A04"  # Patient Registration
    ADT_A08 = "ADT^A08"  # Patient Update
    ADT_A31 = "ADT^A31"  # Update Person Information
    ADT_A40 = "ADT^A40"  # Merge Patient
    ORU_R01 = "ORU^R01"  # Observation Result
    SIU_S12 = "SIU^S12"  # New Appointment
    SIU_S13 = "SIU^S13"  # Appointment Rescheduled
    SIU_S14 = "SIU^S14"  # Appointment Modified
    SIU_S15 = "SIU^S15"  # Appointment Cancelled
    MDM_T02 = "MDM^T02"  # Document Status Change


@dataclass
class HL7Segment:
    """Parsed HL7 segment."""
    name: str
    fields: List[str]
    components: List[List[str]] = field(default_factory=list)

    def get_field(self, index: int, default: str = "") -> str:
        """Get field by 1-based index (HL7 convention)."""
        if index <= 0 or index > len(self.fields):
            return default
        return self.fields[index - 1] or default

    def get_component(self, field_index: int, comp_index: int, default: str = "") -> str:
        """Get component from field (1-based indices)."""
        field_val = self.get_field(field_index)
        if not field_val:
            return default
        parts = field_val.split("^")
        if comp_index <= 0 or comp_index > len(parts):
            return default
        return parts[comp_index - 1] or default


@dataclass
class HL7Message:
    """Parsed HL7 v2.x message."""
    raw: str
    message_type: str
    control_id: str
    version: str
    timestamp: Optional[datetime]
    segments: Dict[str, List[HL7Segment]] = field(default_factory=dict)
    sending_facility: str = ""
    receiving_facility: str = ""

    def get_segment(self, name: str, index: int = 0) -> Optional[HL7Segment]:
        """Get segment by name and optional index for repeating segments."""
        segments = self.segments.get(name, [])
        if index < len(segments):
            return segments[index]
        return None

    def get_all_segments(self, name: str) -> List[HL7Segment]:
        """Get all segments with given name."""
        return self.segments.get(name, [])


class HL7Parser:
    """
    HL7 v2.x message parser.

    Parsing follows HL7 2.x specification:
    - Field separator: | (defined in MSH-1)
    - Component separator: ^ (defined in MSH-2)
    - Repetition separator: ~ (defined in MSH-2)
    - Escape character: \\ (defined in MSH-2)
    - Subcomponent separator: & (defined in MSH-2)
    """

    # Standard segment regex pattern
    SEGMENT_PATTERN = re.compile(r"^([A-Z][A-Z0-9]{2})\|(.*)$", re.MULTILINE)

    # HL7 timestamp formats
    TIMESTAMP_FORMATS = [
        "%Y%m%d%H%M%S",      # YYYYMMDDHHmmss
        "%Y%m%d%H%M",        # YYYYMMDDHHmm
        "%Y%m%d",            # YYYYMMDD
        "%Y%m%d%H%M%S.%f",   # With microseconds
        "%Y%m%d%H%M%S%z",    # With timezone
    ]

    @classmethod
    def parse(cls, raw_message: str) -> HL7Message:
        """
        Parse raw HL7 v2.x message into structured format.

        Args:
            raw_message: Raw HL7 message string

        Returns:
            Parsed HL7Message object

        Raises:
            ValueError: If message is malformed or missing required segments
        """
        # Normalize line endings
        raw_message = raw_message.replace("\r\n", "\r").replace("\n", "\r")
        lines = [line.strip() for line in raw_message.split("\r") if line.strip()]

        if not lines:
            raise ValueError("Empty HL7 message")

        # First segment must be MSH
        if not lines[0].startswith("MSH"):
            raise ValueError("HL7 message must start with MSH segment")

        segments: Dict[str, List[HL7Segment]] = {}

        for line in lines:
            segment = cls._parse_segment(line)
            if segment.name not in segments:
                segments[segment.name] = []
            segments[segment.name].append(segment)

        # Extract MSH header information
        msh = segments.get("MSH", [None])[0]
        if not msh:
            raise ValueError("Missing MSH segment")

        message_type = msh.get_field(9)  # MSH-9: Message Type
        control_id = msh.get_field(10)   # MSH-10: Message Control ID
        version = msh.get_field(12)       # MSH-12: Version ID
        timestamp_str = msh.get_field(7)  # MSH-7: Date/Time of Message
        sending_facility = msh.get_component(4, 1)    # MSH-4.1
        receiving_facility = msh.get_component(6, 1)  # MSH-6.1

        timestamp = cls._parse_timestamp(timestamp_str)

        return HL7Message(
            raw=raw_message,
            message_type=message_type,
            control_id=control_id,
            version=version,
            timestamp=timestamp,
            segments=segments,
            sending_facility=sending_facility,
            receiving_facility=receiving_facility,
        )

    @classmethod
    def _parse_segment(cls, line: str) -> HL7Segment:
        """Parse single HL7 segment line."""
        if line.startswith("MSH"):
            # MSH segment is special - field separator is first char after MSH
            name = "MSH"
            # MSH-1 is the field separator itself, so we handle it specially
            fields = ["|"] + line[4:].split("|")
        else:
            parts = line.split("|", 1)
            name = parts[0]
            fields = parts[1].split("|") if len(parts) > 1 else []

        return HL7Segment(name=name, fields=fields)

    @classmethod
    def _parse_timestamp(cls, ts_str: str) -> Optional[datetime]:
        """Parse HL7 timestamp string."""
        if not ts_str:
            return None

        # Remove timezone offset for parsing (handle separately if needed)
        ts_clean = ts_str.split("+")[0].split("-")[0] if len(ts_str) > 8 else ts_str

        for fmt in cls.TIMESTAMP_FORMATS:
            try:
                return datetime.strptime(ts_clean[:len(ts_clean)], fmt[:len(ts_clean) + 2])
            except ValueError:
                continue

        logger.warning(f"Unable to parse HL7 timestamp: {ts_str}")
        return None


class HL7ToFHIRConverter:
    """
    Convert HL7 v2.x messages to FHIR R4 resources.

    Mapping follows HL7 v2 to FHIR R4 ConceptMap guidelines.
    """

    @classmethod
    def convert(cls, message: HL7Message) -> List[Dict[str, Any]]:
        """
        Convert HL7 message to FHIR resources.

        Args:
            message: Parsed HL7 message

        Returns:
            List of FHIR resources generated from message
        """
        msg_type = message.message_type.split("^")[0] if "^" in message.message_type else message.message_type

        converters = {
            "ADT": cls._convert_adt,
            "ORU": cls._convert_oru,
            "SIU": cls._convert_siu,
            "MDM": cls._convert_mdm,
        }

        converter = converters.get(msg_type)
        if not converter:
            logger.warning(f"No converter for message type: {msg_type}")
            return []

        return converter(message)

    @classmethod
    def _convert_adt(cls, message: HL7Message) -> List[Dict[str, Any]]:
        """Convert ADT message to FHIR Patient and Encounter."""
        resources = []

        # Extract PID segment (Patient Identification)
        pid = message.get_segment("PID")
        if pid:
            patient = cls._pid_to_patient(pid, message.sending_facility)
            resources.append(patient)

        # Extract PV1 segment (Patient Visit)
        pv1 = message.get_segment("PV1")
        if pv1 and pid:
            encounter = cls._pv1_to_encounter(pv1, pid, message)
            resources.append(encounter)

        # Extract NK1 segments (Next of Kin)
        for nk1 in message.get_all_segments("NK1"):
            related_person = cls._nk1_to_related_person(nk1, pid)
            if related_person:
                resources.append(related_person)

        # Extract DG1 segments (Diagnosis)
        for dg1 in message.get_all_segments("DG1"):
            condition = cls._dg1_to_condition(dg1, pid)
            if condition:
                resources.append(condition)

        return resources

    @classmethod
    def _convert_oru(cls, message: HL7Message) -> List[Dict[str, Any]]:
        """Convert ORU message to FHIR Observations."""
        resources = []

        pid = message.get_segment("PID")
        patient_id = pid.get_field(3).split("^")[0] if pid else "unknown"

        # Process OBR/OBX groups
        obr_segments = message.get_all_segments("OBR")
        obx_segments = message.get_all_segments("OBX")

        for obx in obx_segments:
            observation = cls._obx_to_observation(obx, patient_id, message.sending_facility)
            if observation:
                resources.append(observation)

        return resources

    @classmethod
    def _convert_siu(cls, message: HL7Message) -> List[Dict[str, Any]]:
        """Convert SIU message to FHIR Appointment."""
        resources = []

        sch = message.get_segment("SCH")
        pid = message.get_segment("PID")
        pv1 = message.get_segment("PV1")
        ail = message.get_segment("AIL")  # Appointment Information - Location
        aip = message.get_segment("AIP")  # Appointment Information - Personnel

        if sch:
            appointment = cls._sch_to_appointment(sch, pid, pv1, ail, aip, message)
            resources.append(appointment)

        return resources

    @classmethod
    def _convert_mdm(cls, message: HL7Message) -> List[Dict[str, Any]]:
        """Convert MDM message to FHIR DocumentReference."""
        resources = []

        txa = message.get_segment("TXA")
        pid = message.get_segment("PID")

        if txa:
            doc_ref = cls._txa_to_document_reference(txa, pid, message)
            resources.append(doc_ref)

        return resources

    @classmethod
    def _pid_to_patient(cls, pid: HL7Segment, source_system: str) -> Dict[str, Any]:
        """Convert PID segment to FHIR Patient resource."""
        # PID-3: Patient Identifier List (MRN)
        patient_id = pid.get_component(3, 1)

        # PID-5: Patient Name
        family_name = pid.get_component(5, 1)
        given_name = pid.get_component(5, 2)
        middle_name = pid.get_component(5, 3)
        name_suffix = pid.get_component(5, 4)
        name_prefix = pid.get_component(5, 5)

        # PID-7: Date of Birth
        dob = pid.get_field(7)

        # PID-8: Administrative Sex
        sex_code = pid.get_field(8)
        gender_map = {"M": "male", "F": "female", "O": "other", "U": "unknown"}
        gender = gender_map.get(sex_code, "unknown")

        # PID-11: Patient Address
        address_street = pid.get_component(11, 1)
        address_city = pid.get_component(11, 3)
        address_state = pid.get_component(11, 4)
        address_zip = pid.get_component(11, 5)
        address_country = pid.get_component(11, 6)

        # PID-13: Phone Number - Home
        home_phone = pid.get_component(13, 1)

        # PID-14: Phone Number - Business
        work_phone = pid.get_component(14, 1)

        # PID-19: SSN
        ssn = pid.get_field(19)

        # Build FHIR Patient
        patient = {
            "resourceType": "Patient",
            "id": patient_id,
            "identifier": [
                {
                    "use": "usual",
                    "type": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                "code": "MR",
                                "display": "Medical Record Number",
                            }
                        ]
                    },
                    "system": f"urn:oid:{source_system}",
                    "value": patient_id,
                }
            ],
            "name": [
                {
                    "use": "official",
                    "family": family_name,
                    "given": [g for g in [given_name, middle_name] if g],
                }
            ],
            "gender": gender,
        }

        # Add prefix/suffix if present
        if name_prefix:
            patient["name"][0]["prefix"] = [name_prefix]
        if name_suffix:
            patient["name"][0]["suffix"] = [name_suffix]

        # Add birth date if present
        if dob:
            patient["birthDate"] = cls._format_date(dob)

        # Add address if present
        if address_street or address_city:
            patient["address"] = [
                {
                    "use": "home",
                    "line": [address_street] if address_street else [],
                    "city": address_city,
                    "state": address_state,
                    "postalCode": address_zip,
                    "country": address_country,
                }
            ]

        # Add telecom if present
        telecom = []
        if home_phone:
            telecom.append({"system": "phone", "value": home_phone, "use": "home"})
        if work_phone:
            telecom.append({"system": "phone", "value": work_phone, "use": "work"})
        if telecom:
            patient["telecom"] = telecom

        return patient

    @classmethod
    def _pv1_to_encounter(
        cls, pv1: HL7Segment, pid: HL7Segment, message: HL7Message
    ) -> Dict[str, Any]:
        """Convert PV1 segment to FHIR Encounter resource."""
        patient_id = pid.get_component(3, 1)
        visit_number = pv1.get_component(19, 1)  # PV1-19: Visit Number

        # PV1-2: Patient Class (I=Inpatient, O=Outpatient, E=Emergency)
        patient_class = pv1.get_field(2)
        class_map = {
            "I": {"code": "IMP", "display": "inpatient encounter"},
            "O": {"code": "AMB", "display": "ambulatory"},
            "E": {"code": "EMER", "display": "emergency"},
            "P": {"code": "PRENC", "display": "pre-admission"},
        }
        encounter_class = class_map.get(patient_class, {"code": "AMB", "display": "ambulatory"})

        # PV1-3: Assigned Patient Location
        location = pv1.get_component(3, 1)

        # PV1-7: Attending Doctor
        attending_id = pv1.get_component(7, 1)
        attending_family = pv1.get_component(7, 2)
        attending_given = pv1.get_component(7, 3)

        # PV1-44: Admit Date/Time
        admit_dt = pv1.get_field(44)

        # PV1-45: Discharge Date/Time
        discharge_dt = pv1.get_field(45)

        # Determine status based on message type
        msg_event = message.message_type.split("^")[1] if "^" in message.message_type else ""
        status_map = {
            "A01": "in-progress",   # Admit
            "A02": "in-progress",   # Transfer
            "A03": "finished",      # Discharge
            "A04": "arrived",       # Registration
            "A08": "in-progress",   # Update
        }
        status = status_map.get(msg_event, "unknown")

        encounter = {
            "resourceType": "Encounter",
            "id": visit_number or f"enc-{patient_id}-{message.control_id}",
            "status": status,
            "class": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": encounter_class["code"],
                "display": encounter_class["display"],
            },
            "subject": {"reference": f"Patient/{patient_id}"},
        }

        # Add period if dates available
        if admit_dt:
            encounter["period"] = {"start": cls._format_datetime(admit_dt)}
            if discharge_dt:
                encounter["period"]["end"] = cls._format_datetime(discharge_dt)

        # Add location if present
        if location:
            encounter["location"] = [
                {
                    "location": {"display": location},
                    "status": "active",
                }
            ]

        # Add attending practitioner
        if attending_id:
            encounter["participant"] = [
                {
                    "type": [
                        {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                                    "code": "ATND",
                                    "display": "attender",
                                }
                            ]
                        }
                    ],
                    "individual": {
                        "reference": f"Practitioner/{attending_id}",
                        "display": f"{attending_given} {attending_family}".strip(),
                    },
                }
            ]

        return encounter

    @classmethod
    def _obx_to_observation(
        cls, obx: HL7Segment, patient_id: str, source_system: str
    ) -> Optional[Dict[str, Any]]:
        """Convert OBX segment to FHIR Observation resource."""
        # OBX-1: Set ID
        set_id = obx.get_field(1)

        # OBX-2: Value Type (NM=Numeric, ST=String, CE=Coded Entry, etc.)
        value_type = obx.get_field(2)

        # OBX-3: Observation Identifier (LOINC code)
        obs_id = obx.get_component(3, 1)
        obs_text = obx.get_component(3, 2)
        obs_system = obx.get_component(3, 3) or "http://loinc.org"

        # OBX-5: Observation Value
        obs_value = obx.get_field(5)

        # OBX-6: Units
        unit_code = obx.get_component(6, 1)
        unit_text = obx.get_component(6, 2)

        # OBX-7: Reference Range
        reference_range = obx.get_field(7)

        # OBX-8: Abnormal Flags
        abnormal_flag = obx.get_field(8)

        # OBX-11: Observation Result Status
        status_code = obx.get_field(11)
        status_map = {
            "F": "final",
            "P": "preliminary",
            "C": "corrected",
            "D": "cancelled",
            "X": "cancelled",
        }
        status = status_map.get(status_code, "final")

        # OBX-14: Date/Time of Observation
        obs_datetime = obx.get_field(14)

        if not obs_id:
            return None

        observation = {
            "resourceType": "Observation",
            "id": f"obs-{patient_id}-{obs_id}-{set_id}",
            "status": status,
            "code": {
                "coding": [
                    {
                        "system": obs_system if "loinc" in obs_system.lower() else "http://loinc.org",
                        "code": obs_id,
                        "display": obs_text,
                    }
                ],
                "text": obs_text,
            },
            "subject": {"reference": f"Patient/{patient_id}"},
        }

        # Add effective date/time
        if obs_datetime:
            observation["effectiveDateTime"] = cls._format_datetime(obs_datetime)

        # Add value based on type
        if value_type == "NM" and obs_value:
            try:
                observation["valueQuantity"] = {
                    "value": float(obs_value),
                    "unit": unit_text or unit_code,
                    "system": "http://unitsofmeasure.org",
                    "code": unit_code,
                }
            except ValueError:
                observation["valueString"] = obs_value
        elif value_type == "ST":
            observation["valueString"] = obs_value
        elif value_type == "CE":
            coded_value = obx.get_component(5, 1)
            coded_text = obx.get_component(5, 2)
            observation["valueCodeableConcept"] = {
                "coding": [{"code": coded_value, "display": coded_text}],
                "text": coded_text,
            }
        elif obs_value:
            observation["valueString"] = obs_value

        # Add reference range
        if reference_range:
            observation["referenceRange"] = [{"text": reference_range}]

        # Add interpretation if abnormal
        if abnormal_flag:
            interpretation_map = {
                "H": {"code": "H", "display": "High"},
                "L": {"code": "L", "display": "Low"},
                "A": {"code": "A", "display": "Abnormal"},
                "N": {"code": "N", "display": "Normal"},
                "HH": {"code": "HH", "display": "Critical High"},
                "LL": {"code": "LL", "display": "Critical Low"},
            }
            if abnormal_flag in interpretation_map:
                observation["interpretation"] = [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                                **interpretation_map[abnormal_flag],
                            }
                        ]
                    }
                ]

        return observation

    @classmethod
    def _sch_to_appointment(
        cls,
        sch: HL7Segment,
        pid: Optional[HL7Segment],
        pv1: Optional[HL7Segment],
        ail: Optional[HL7Segment],
        aip: Optional[HL7Segment],
        message: HL7Message,
    ) -> Dict[str, Any]:
        """Convert SCH segment to FHIR Appointment resource."""
        # SCH-1: Placer Appointment ID
        appt_id = sch.get_component(1, 1)

        # SCH-2: Filler Appointment ID
        filler_id = sch.get_component(2, 1)

        # SCH-7: Appointment Reason
        reason_code = sch.get_component(7, 1)
        reason_text = sch.get_component(7, 2)

        # SCH-11: Appointment Timing Quantity
        # Format: start^end^duration^unit^start_offset
        timing = sch.get_field(11)
        start_dt = sch.get_component(11, 4) if timing else ""
        end_dt = sch.get_component(11, 5) if timing else ""
        duration_val = sch.get_component(11, 3) if timing else ""

        # SCH-25: Filler Status Code
        status_code = sch.get_component(25, 1)
        status_map = {
            "Booked": "booked",
            "Pending": "pending",
            "Complete": "fulfilled",
            "Cancelled": "cancelled",
            "Noshow": "noshow",
        }
        status = status_map.get(status_code, "proposed")

        # Determine status from message event if not in segment
        msg_event = message.message_type.split("^")[1] if "^" in message.message_type else ""
        if msg_event == "S15":
            status = "cancelled"
        elif msg_event == "S12":
            status = "booked"

        patient_id = pid.get_component(3, 1) if pid else "unknown"

        appointment = {
            "resourceType": "Appointment",
            "id": appt_id or filler_id or f"appt-{message.control_id}",
            "status": status,
            "participant": [
                {
                    "actor": {"reference": f"Patient/{patient_id}"},
                    "required": "required",
                    "status": "accepted",
                }
            ],
        }

        # Add timing
        if start_dt:
            appointment["start"] = cls._format_datetime(start_dt)
        if end_dt:
            appointment["end"] = cls._format_datetime(end_dt)
        if duration_val:
            try:
                appointment["minutesDuration"] = int(duration_val)
            except ValueError:
                pass

        # Add reason
        if reason_text or reason_code:
            appointment["reasonCode"] = [
                {
                    "coding": [{"code": reason_code, "display": reason_text}] if reason_code else [],
                    "text": reason_text,
                }
            ]

        # Add location from AIL segment
        if ail:
            location_id = ail.get_component(3, 1)
            location_name = ail.get_component(3, 2)
            if location_id or location_name:
                appointment["participant"].append(
                    {
                        "actor": {
                            "reference": f"Location/{location_id}" if location_id else None,
                            "display": location_name,
                        },
                        "required": "required",
                        "status": "accepted",
                    }
                )

        # Add practitioner from AIP segment
        if aip:
            provider_id = aip.get_component(3, 1)
            provider_family = aip.get_component(3, 2)
            provider_given = aip.get_component(3, 3)
            if provider_id:
                appointment["participant"].append(
                    {
                        "actor": {
                            "reference": f"Practitioner/{provider_id}",
                            "display": f"{provider_given} {provider_family}".strip(),
                        },
                        "required": "required",
                        "status": "accepted",
                    }
                )

        return appointment

    @classmethod
    def _nk1_to_related_person(
        cls, nk1: HL7Segment, pid: Optional[HL7Segment]
    ) -> Optional[Dict[str, Any]]:
        """Convert NK1 segment to FHIR RelatedPerson resource."""
        # NK1-2: Name
        family_name = nk1.get_component(2, 1)
        given_name = nk1.get_component(2, 2)

        # NK1-3: Relationship
        relationship_code = nk1.get_component(3, 1)
        relationship_text = nk1.get_component(3, 2)

        # NK1-5: Phone
        phone = nk1.get_component(5, 1)

        if not family_name:
            return None

        patient_id = pid.get_component(3, 1) if pid else "unknown"

        return {
            "resourceType": "RelatedPerson",
            "id": f"rp-{patient_id}-{family_name}".lower().replace(" ", "-"),
            "patient": {"reference": f"Patient/{patient_id}"},
            "relationship": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
                            "code": relationship_code,
                            "display": relationship_text,
                        }
                    ],
                    "text": relationship_text,
                }
            ],
            "name": [{"family": family_name, "given": [given_name] if given_name else []}],
            "telecom": [{"system": "phone", "value": phone}] if phone else [],
        }

    @classmethod
    def _dg1_to_condition(
        cls, dg1: HL7Segment, pid: Optional[HL7Segment]
    ) -> Optional[Dict[str, Any]]:
        """Convert DG1 segment to FHIR Condition resource."""
        # DG1-3: Diagnosis Code
        dx_code = dg1.get_component(3, 1)
        dx_text = dg1.get_component(3, 2)
        dx_system = dg1.get_component(3, 3) or "http://hl7.org/fhir/sid/icd-10-cm"

        # DG1-5: Diagnosis Date/Time
        dx_datetime = dg1.get_field(5)

        # DG1-6: Diagnosis Type
        dx_type = dg1.get_field(6)

        if not dx_code:
            return None

        patient_id = pid.get_component(3, 1) if pid else "unknown"

        return {
            "resourceType": "Condition",
            "id": f"cond-{patient_id}-{dx_code}".lower().replace(".", "-"),
            "clinicalStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        "code": "active",
                    }
                ]
            },
            "code": {
                "coding": [
                    {
                        "system": dx_system,
                        "code": dx_code,
                        "display": dx_text,
                    }
                ],
                "text": dx_text,
            },
            "subject": {"reference": f"Patient/{patient_id}"},
            "recordedDate": cls._format_datetime(dx_datetime) if dx_datetime else None,
        }

    @classmethod
    def _txa_to_document_reference(
        cls, txa: HL7Segment, pid: Optional[HL7Segment], message: HL7Message
    ) -> Dict[str, Any]:
        """Convert TXA segment to FHIR DocumentReference resource."""
        # TXA-1: Set ID
        set_id = txa.get_field(1)

        # TXA-2: Document Type
        doc_type_code = txa.get_component(2, 1)
        doc_type_text = txa.get_component(2, 2)

        # TXA-4: Activity Date/Time
        activity_dt = txa.get_field(4)

        # TXA-12: Unique Document Number
        doc_id = txa.get_component(12, 1)

        # TXA-17: Document Completion Status
        status_code = txa.get_field(17)
        status_map = {
            "AU": "current",
            "DI": "superseded",
            "DO": "current",
            "LA": "current",
        }
        status = status_map.get(status_code, "current")

        patient_id = pid.get_component(3, 1) if pid else "unknown"

        return {
            "resourceType": "DocumentReference",
            "id": doc_id or f"doc-{message.control_id}",
            "status": status,
            "type": {
                "coding": [{"code": doc_type_code, "display": doc_type_text}],
                "text": doc_type_text,
            },
            "subject": {"reference": f"Patient/{patient_id}"},
            "date": cls._format_datetime(activity_dt) if activity_dt else None,
        }

    @staticmethod
    def _format_date(hl7_date: str) -> str:
        """Format HL7 date (YYYYMMDD) to FHIR date (YYYY-MM-DD)."""
        if len(hl7_date) >= 8:
            return f"{hl7_date[:4]}-{hl7_date[4:6]}-{hl7_date[6:8]}"
        return hl7_date

    @staticmethod
    def _format_datetime(hl7_datetime: str) -> str:
        """Format HL7 datetime to FHIR datetime (ISO 8601)."""
        if len(hl7_datetime) >= 12:
            return f"{hl7_datetime[:4]}-{hl7_datetime[4:6]}-{hl7_datetime[6:8]}T{hl7_datetime[8:10]}:{hl7_datetime[10:12]}:00Z"
        elif len(hl7_datetime) >= 8:
            return f"{hl7_datetime[:4]}-{hl7_datetime[4:6]}-{hl7_datetime[6:8]}"
        return hl7_datetime


class HL7v2Adapter(BaseEHRAdapter):
    """
    HL7 v2.x adapter for legacy EHR integrations.

    Supports both TCP/MLLP connections and message file processing.
    Converts HL7 v2.x messages to FHIR R4 format.
    """

    # MLLP framing characters
    MLLP_START = b"\x0b"  # Vertical Tab
    MLLP_END = b"\x1c\r"  # File Separator + Carriage Return

    def __init__(self, config: AdapterConfig, audit_logger: Optional[Callable] = None):
        super().__init__(config, audit_logger)
        self._socket: Optional[socket.socket] = None
        self._message_queue: List[HL7Message] = []
        self._fhir_cache: Dict[str, FHIRResource] = {}

        if not config.base_url:
            logger.info("HL7v2 adapter initialized in message processing mode (no TCP connection)")

    def authenticate(
        self, authorization_code: Optional[str] = None, redirect_uri: Optional[str] = None
    ) -> bool:
        """
        Establish TCP/MLLP connection or validate file processing mode.

        For TCP mode, connects to the configured host:port.
        For file processing mode, validates configuration.
        """
        self._status = ConnectionStatus.CONNECTING

        # Check if this is TCP mode or file processing mode
        if not self.config.base_url:
            # File processing mode - no connection needed
            self._status = ConnectionStatus.CONNECTED
            self._log_audit("AUTHENTICATE", "HL7v2", success=True, details={"mode": "file_processing"})
            return True

        try:
            # Parse host:port from base_url
            url_parts = self.config.base_url.replace("mllp://", "").replace("tcp://", "").split(":")
            host = url_parts[0]
            port = int(url_parts[1]) if len(url_parts) > 1 else 2575  # Default HL7 port

            self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self._socket.settimeout(self.config.timeout_seconds)
            self._socket.connect((host, port))

            self._status = ConnectionStatus.CONNECTED
            self._log_audit(
                "AUTHENTICATE",
                "HL7v2",
                success=True,
                details={"host": host, "port": port, "mode": "tcp"},
            )
            return True

        except socket.error as e:
            logger.error(f"HL7v2 TCP connection failed: {e}")
            self._status = ConnectionStatus.ERROR
            self._log_audit("AUTHENTICATE", "HL7v2", success=False, details={"error": str(e)})
            return False

    def refresh_token(self) -> bool:
        """No token refresh needed for HL7v2 connections."""
        return self.is_connected

    def disconnect(self) -> None:
        """Close TCP connection if open."""
        if self._socket:
            try:
                self._socket.close()
            except socket.error:
                pass
            self._socket = None
        super().disconnect()

    def send_message(self, message: str) -> Optional[str]:
        """
        Send HL7 message via MLLP and receive ACK.

        Args:
            message: Raw HL7 message string

        Returns:
            ACK message string or None if failed
        """
        if not self._socket:
            logger.error("Not connected - cannot send HL7 message")
            return None

        try:
            # Wrap message with MLLP framing
            mllp_message = self.MLLP_START + message.encode("utf-8") + self.MLLP_END
            self._socket.sendall(mllp_message)

            # Receive ACK
            response = b""
            while True:
                chunk = self._socket.recv(4096)
                if not chunk:
                    break
                response += chunk
                if self.MLLP_END in response:
                    break

            # Strip MLLP framing
            ack = response.replace(self.MLLP_START, b"").replace(self.MLLP_END, b"").decode("utf-8")
            return ack

        except socket.error as e:
            logger.error(f"Failed to send HL7 message: {e}")
            return None

    def process_message(self, raw_message: str) -> Tuple[List[FHIRResource], HL7Message]:
        """
        Process incoming HL7 message and convert to FHIR resources.

        Args:
            raw_message: Raw HL7 v2.x message string

        Returns:
            Tuple of (list of FHIR resources, parsed HL7 message)
        """
        # Parse HL7 message
        parsed = HL7Parser.parse(raw_message)
        self._log_audit(
            "PROCESS_MESSAGE",
            "HL7v2",
            resource_id=parsed.control_id,
            details={"message_type": parsed.message_type},
        )

        # Convert to FHIR resources
        fhir_dicts = HL7ToFHIRConverter.convert(parsed)

        # Wrap in FHIRResource objects and cache
        resources = []
        for fhir_dict in fhir_dicts:
            resource = FHIRResource(
                resource_type=fhir_dict.get("resourceType", "Unknown"),
                resource_id=fhir_dict.get("id", ""),
                data=fhir_dict,
                source_system=f"hl7v2:{self.config.partner_id}",
                retrieved_at=datetime.utcnow(),
            )
            resources.append(resource)

            # Cache for later retrieval
            cache_key = f"{resource.resource_type}/{resource.resource_id}"
            self._fhir_cache[cache_key] = resource

        return resources, parsed

    def generate_ack(self, message: HL7Message, ack_code: str = "AA") -> str:
        """
        Generate HL7 ACK response for received message.

        Args:
            message: Parsed incoming message
            ack_code: AA (Accept), AE (Error), AR (Reject)

        Returns:
            HL7 ACK message string
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")

        ack = f"""MSH|^~\\&|IHEP|IHEP_GATEWAY|{message.sending_facility}|{message.sending_facility}|{timestamp}||ACK^{message.message_type.split('^')[1] if '^' in message.message_type else 'A01'}|{timestamp}|P|2.5.1
MSA|{ack_code}|{message.control_id}|Message processed successfully"""

        return ack

    # === BaseEHRAdapter Implementation ===

    def fetch_patient(self, patient_id: str) -> Optional[FHIRResource]:
        """Retrieve patient from cache (populated via process_message)."""
        self._log_audit("FETCH_PATIENT", "Patient", patient_id)
        cache_key = f"Patient/{patient_id}"
        return self._fhir_cache.get(cache_key)

    def search_patients(
        self,
        family_name: Optional[str] = None,
        given_name: Optional[str] = None,
        birthdate: Optional[str] = None,
        identifier: Optional[str] = None,
        limit: int = 100,
    ) -> List[FHIRResource]:
        """Search patients in cache."""
        self._log_audit("SEARCH_PATIENTS", "Patient")
        results = []

        for key, resource in self._fhir_cache.items():
            if not key.startswith("Patient/"):
                continue

            patient = resource.data
            matches = True

            if family_name:
                names = patient.get("name", [])
                if not any(family_name.lower() in n.get("family", "").lower() for n in names):
                    matches = False

            if given_name and matches:
                names = patient.get("name", [])
                if not any(
                    given_name.lower() in " ".join(n.get("given", [])).lower() for n in names
                ):
                    matches = False

            if birthdate and matches:
                if patient.get("birthDate") != birthdate:
                    matches = False

            if identifier and matches:
                ids = patient.get("identifier", [])
                if not any(identifier in i.get("value", "") for i in ids):
                    matches = False

            if matches:
                results.append(resource)
                if len(results) >= limit:
                    break

        return results

    def fetch_observations(
        self,
        patient_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
        codes: Optional[List[str]] = None,
        limit: int = 100,
    ) -> List[FHIRResource]:
        """Fetch observations from cache."""
        self._log_audit("FETCH_OBSERVATIONS", "Observation", patient_id)
        results = []

        for key, resource in self._fhir_cache.items():
            if not key.startswith("Observation/"):
                continue

            obs = resource.data
            subject_ref = obs.get("subject", {}).get("reference", "")

            if f"Patient/{patient_id}" not in subject_ref:
                continue

            results.append(resource)
            if len(results) >= limit:
                break

        return results

    def push_observation(self, patient_id: str, observation: Dict[str, Any]) -> Optional[str]:
        """Push observation - generates ORU message if connected."""
        self._log_audit("PUSH_OBSERVATION", "Observation", patient_id)

        if not self._socket:
            logger.warning("HL7v2 adapter not in TCP mode - cannot push observation")
            return None

        # Generate ORU^R01 message
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        control_id = f"IHEP{timestamp}"

        # Extract observation details
        code = observation.get("code", {}).get("coding", [{}])[0]
        value = observation.get("valueQuantity", {})

        oru_message = f"""MSH|^~\\&|IHEP|IHEP_GATEWAY|{self.config.partner_id}|EHR|{timestamp}||ORU^R01|{control_id}|P|2.5.1
PID|1||{patient_id}^^^{self.config.partner_id}^MR
OBR|1|||{code.get('code', '')}^{code.get('display', '')}|||{timestamp}
OBX|1|NM|{code.get('code', '')}^{code.get('display', '')}||{value.get('value', '')}|{value.get('unit', '')}"""

        ack = self.send_message(oru_message)
        if ack and "AA" in ack:
            return control_id
        return None

    def fetch_appointments(
        self,
        patient_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100,
    ) -> List[FHIRResource]:
        """Fetch appointments from cache."""
        self._log_audit("FETCH_APPOINTMENTS", "Appointment", patient_id)
        results = []

        for key, resource in self._fhir_cache.items():
            if not key.startswith("Appointment/"):
                continue

            appt = resource.data
            participants = appt.get("participant", [])

            if not any(
                f"Patient/{patient_id}" in p.get("actor", {}).get("reference", "")
                for p in participants
            ):
                continue

            results.append(resource)
            if len(results) >= limit:
                break

        return results

    def create_appointment(self, appointment: Dict[str, Any]) -> Optional[str]:
        """Create appointment - generates SIU message if connected."""
        self._log_audit("CREATE_APPOINTMENT", "Appointment")

        if not self._socket:
            logger.warning("HL7v2 adapter not in TCP mode - cannot create appointment")
            return None

        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        control_id = f"IHEP{timestamp}"

        # Extract appointment details
        participants = appointment.get("participant", [])
        patient_ref = ""
        for p in participants:
            ref = p.get("actor", {}).get("reference", "")
            if "Patient/" in ref:
                patient_ref = ref.replace("Patient/", "")
                break

        start = appointment.get("start", "").replace("-", "").replace(":", "").replace("T", "")[:12]

        siu_message = f"""MSH|^~\\&|IHEP|IHEP_GATEWAY|{self.config.partner_id}|EHR|{timestamp}||SIU^S12|{control_id}|P|2.5.1
SCH|{control_id}|{control_id}||||{appointment.get('reasonCode', [{}])[0].get('text', '')}|||{start}|||||||Booked
PID|1||{patient_ref}^^^{self.config.partner_id}^MR"""

        ack = self.send_message(siu_message)
        if ack and "AA" in ack:
            return control_id
        return None

    def fetch_care_plans(
        self, patient_id: str, status: Optional[str] = None, category: Optional[str] = None
    ) -> List[FHIRResource]:
        """Fetch care plans from cache (HL7 v2.x has limited care plan support)."""
        return []

    def fetch_conditions(
        self,
        patient_id: str,
        clinical_status: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[FHIRResource]:
        """Fetch conditions from cache."""
        self._log_audit("FETCH_CONDITIONS", "Condition", patient_id)
        results = []

        for key, resource in self._fhir_cache.items():
            if not key.startswith("Condition/") and not key.startswith("cond-"):
                continue

            condition = resource.data
            subject_ref = condition.get("subject", {}).get("reference", "")

            if f"Patient/{patient_id}" not in subject_ref:
                continue

            results.append(resource)

        return results

    def fetch_medications(
        self, patient_id: str, status: Optional[str] = None
    ) -> List[FHIRResource]:
        """Fetch medications from cache."""
        self._log_audit("FETCH_MEDICATIONS", "MedicationStatement", patient_id)
        results = []

        for key, resource in self._fhir_cache.items():
            if not key.startswith("MedicationStatement/"):
                continue

            med = resource.data
            subject_ref = med.get("subject", {}).get("reference", "")

            if f"Patient/{patient_id}" not in subject_ref:
                continue

            results.append(resource)

        return results

    def subscribe_to_events(
        self,
        event_types: List[str],
        webhook_url: str,
        patient_id: Optional[str] = None,
    ) -> Optional[str]:
        """
        HL7 v2.x uses TCP listeners rather than webhooks.
        Returns subscription ID for internal tracking.
        """
        self._log_audit("SUBSCRIBE", "Subscription")
        subscription_id = f"hl7v2-sub-{int(time.time())}"
        logger.info(
            f"HL7v2 subscription registered: {subscription_id} for events {event_types}"
        )
        return subscription_id

    def unsubscribe(self, subscription_id: str) -> bool:
        """Remove subscription."""
        logger.info(f"HL7v2 subscription removed: {subscription_id}")
        return True

    def bulk_fetch(
        self,
        resource_type: str,
        since: Optional[datetime] = None,
        patient_ids: Optional[List[str]] = None,
    ) -> SyncResult:
        """
        Bulk fetch from cache.

        HL7 v2.x doesn't support bulk operations natively - data comes via messages.
        """
        start_time = time.time()
        result = SyncResult(success=True)

        count = 0
        for key, resource in self._fhir_cache.items():
            if key.startswith(f"{resource_type}/"):
                count += 1

        result.records_processed = count
        result.duration_ms = int((time.time() - start_time) * 1000)
        return result

    def health_check(self) -> Dict[str, Any]:
        """Check HL7v2 adapter health."""
        return {
            "vendor": "hl7v2",
            "partner_id": self.config.partner_id,
            "status": self._status.value,
            "connected": self.is_connected,
            "mode": "tcp" if self._socket else "file_processing",
            "cached_resources": len(self._fhir_cache),
            "supported_message_types": [mt.value for mt in HL7MessageType],
        }
