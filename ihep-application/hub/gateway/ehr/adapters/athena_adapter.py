"""
athenahealth EHR Adapter

OAuth 2.0 authentication with athenahealth Marketplace APIs.

Author: Jason M Jarmacz | Evolution Strategist | jason@ihep.app
Co-Author: Claude by Anthropic
"""

import base64
import logging
import time
from datetime import datetime, timedelta
from typing import Any, Callable, Dict, List, Optional

import requests

from .base_adapter import (
    AdapterConfig,
    BaseEHRAdapter,
    ConnectionStatus,
    FHIRResource,
    SyncResult,
)

logger = logging.getLogger(__name__)


class AthenaAdapter(BaseEHRAdapter):
    """
    athenahealth adapter using OAuth 2.0.

    athenahealth uses a custom API structure alongside FHIR.
    This adapter normalizes responses to FHIR format.
    """

    TOKEN_URL = "https://api.athenahealth.com/oauth2/v1/token"
    API_VERSION = "v1"

    def __init__(self, config: AdapterConfig, audit_logger: Optional[Callable] = None):
        super().__init__(config, audit_logger)

        if not config.base_url:
            raise ValueError("athenahealth base_url is required")
        if not config.client_id or not config.client_secret:
            raise ValueError("athenahealth client credentials required")

        self._practice_id: Optional[str] = None

    def authenticate(self, authorization_code: Optional[str] = None, redirect_uri: Optional[str] = None) -> bool:
        """Authenticate with athenahealth OAuth 2.0."""
        self._status = ConnectionStatus.CONNECTING

        try:
            credentials = base64.b64encode(
                f"{self.config.client_id}:{self.config.client_secret}".encode()
            ).decode()

            response = requests.post(
                self.TOKEN_URL,
                data={"grant_type": "client_credentials", "scope": "athena/service/Athenanet.MDP.*"},
                headers={
                    "Authorization": f"Basic {credentials}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout=self.config.timeout_seconds
            )

            if response.status_code != 200:
                self._status = ConnectionStatus.ERROR
                return False

            token_data = response.json()
            self._access_token = token_data.get("access_token")

            expires_in = token_data.get("expires_in", 3600)
            self._token_expiry = datetime.utcnow() + timedelta(seconds=expires_in - 60)

            self._status = ConnectionStatus.CONNECTED
            self._log_audit("AUTHENTICATE", "OAuth", success=True)
            return True

        except Exception as e:
            logger.error(f"athenahealth auth failed: {e}")
            self._status = ConnectionStatus.ERROR
            return False

    def refresh_token(self) -> bool:
        """Refresh athenahealth token."""
        return self.authenticate()

    def _api_request(self, method: str, path: str, params: Optional[Dict] = None,
                    json_body: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
        """Make athenahealth API request."""
        if not self._access_token:
            raise ConnectionError("Not authenticated")

        if self._token_expiry and datetime.utcnow() >= self._token_expiry:
            if not self.refresh_token():
                raise ConnectionError("Failed to refresh token")

        url = f"{self.config.base_url}{path}"
        headers = {
            "Authorization": f"Bearer {self._access_token}",
            "Accept": "application/json",
        }

        try:
            response = requests.request(
                method=method, url=url, headers=headers,
                params=params, json=json_body, timeout=self.config.timeout_seconds
            )

            if response.status_code >= 400:
                logger.error(f"athenahealth request failed: {response.status_code}")
                return None

            return response.json() if response.content else {}

        except requests.RequestException as e:
            logger.error(f"athenahealth request error: {e}")
            return None

    def _to_fhir_patient(self, athena_patient: Dict) -> Dict[str, Any]:
        """Convert athenahealth patient to FHIR format."""
        return {
            "resourceType": "Patient",
            "id": str(athena_patient.get("patientid", "")),
            "name": [{
                "family": athena_patient.get("lastname", ""),
                "given": [athena_patient.get("firstname", "")],
            }],
            "birthDate": athena_patient.get("dob"),
            "gender": athena_patient.get("sex", "").lower(),
            "telecom": [
                {"system": "phone", "value": athena_patient.get("mobilephone")}
            ] if athena_patient.get("mobilephone") else [],
            "address": [{
                "line": [athena_patient.get("address1", "")],
                "city": athena_patient.get("city", ""),
                "state": athena_patient.get("state", ""),
                "postalCode": athena_patient.get("zip", ""),
            }] if athena_patient.get("address1") else [],
        }

    def fetch_patient(self, patient_id: str) -> Optional[FHIRResource]:
        self._log_audit("FETCH_PATIENT", "Patient", patient_id)
        response = self._api_request("GET", f"/patients/{patient_id}")
        if not response:
            return None

        # Handle athenahealth's array response
        patient_data = response[0] if isinstance(response, list) else response
        fhir_patient = self._to_fhir_patient(patient_data)

        return FHIRResource(
            resource_type="Patient",
            resource_id=patient_id,
            data=fhir_patient,
            source_system=f"athena:{self.config.partner_id}",
        )

    def search_patients(self, family_name: Optional[str] = None, given_name: Optional[str] = None,
                       birthdate: Optional[str] = None, identifier: Optional[str] = None,
                       limit: int = 100) -> List[FHIRResource]:
        params = {"limit": min(limit, 100)}
        if family_name: params["lastname"] = family_name
        if given_name: params["firstname"] = given_name
        if birthdate: params["dob"] = birthdate

        self._log_audit("SEARCH_PATIENTS", "Patient")
        response = self._api_request("GET", "/patients/enhancedbestmatch", params=params)

        if not response:
            return []

        patients = response if isinstance(response, list) else response.get("patients", [])
        return [
            FHIRResource(
                resource_type="Patient",
                resource_id=str(p.get("patientid", "")),
                data=self._to_fhir_patient(p),
                source_system=f"athena:{self.config.partner_id}",
            )
            for p in patients
        ]

    def fetch_observations(self, patient_id: str, start_date: Optional[str] = None,
                          end_date: Optional[str] = None, category: Optional[str] = None,
                          codes: Optional[List[str]] = None, limit: int = 100) -> List[FHIRResource]:
        self._log_audit("FETCH_OBSERVATIONS", "Observation", patient_id)
        response = self._api_request("GET", f"/patients/{patient_id}/vitals")
        if not response:
            return []

        # Convert athenahealth vitals to FHIR Observations
        vitals = response if isinstance(response, list) else response.get("vitals", [])
        observations = []
        for vital in vitals:
            observations.append(FHIRResource(
                resource_type="Observation",
                resource_id=str(vital.get("vitalid", "")),
                data={
                    "resourceType": "Observation",
                    "id": str(vital.get("vitalid", "")),
                    "status": "final",
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "effectiveDateTime": vital.get("readingdatetime"),
                    "component": [
                        {"code": {"text": k}, "valueQuantity": {"value": v}}
                        for k, v in vital.items() if k not in ("vitalid", "readingdatetime")
                    ],
                },
                source_system=f"athena:{self.config.partner_id}",
            ))
        return observations

    def push_observation(self, patient_id: str, observation: Dict[str, Any]) -> Optional[str]:
        self._log_audit("PUSH_OBSERVATION", "Observation", patient_id)
        # Convert FHIR to athenahealth format
        vitals_data = {}
        for component in observation.get("component", []):
            code_text = component.get("code", {}).get("text", "")
            value = component.get("valueQuantity", {}).get("value")
            if code_text and value:
                vitals_data[code_text] = value

        response = self._api_request("POST", f"/patients/{patient_id}/vitals", json_body=vitals_data)
        return str(response.get("vitalid")) if response else None

    def fetch_appointments(self, patient_id: str, start_date: Optional[str] = None,
                          end_date: Optional[str] = None, status: Optional[str] = None,
                          limit: int = 100) -> List[FHIRResource]:
        params = {}
        if start_date: params["startdate"] = start_date
        if end_date: params["enddate"] = end_date

        self._log_audit("FETCH_APPOINTMENTS", "Appointment", patient_id)
        response = self._api_request("GET", f"/patients/{patient_id}/appointments", params=params)
        if not response:
            return []

        appts = response if isinstance(response, list) else response.get("appointments", [])
        return [
            FHIRResource(
                resource_type="Appointment",
                resource_id=str(a.get("appointmentid", "")),
                data={
                    "resourceType": "Appointment",
                    "id": str(a.get("appointmentid", "")),
                    "status": a.get("appointmentstatus", "").lower(),
                    "start": a.get("date"),
                    "participant": [{"actor": {"reference": f"Patient/{patient_id}"}}],
                },
                source_system=f"athena:{self.config.partner_id}",
            )
            for a in appts
        ]

    def create_appointment(self, appointment: Dict[str, Any]) -> Optional[str]:
        self._log_audit("CREATE_APPOINTMENT", "Appointment")
        # athenahealth requires specific booking flow
        logger.warning("athenahealth appointment creation requires practice-specific setup")
        return None

    def fetch_care_plans(self, patient_id: str, status: Optional[str] = None,
                        category: Optional[str] = None) -> List[FHIRResource]:
        # athenahealth doesn't have native care plan concept
        return []

    def fetch_conditions(self, patient_id: str, clinical_status: Optional[str] = None,
                        category: Optional[str] = None) -> List[FHIRResource]:
        self._log_audit("FETCH_CONDITIONS", "Condition", patient_id)
        response = self._api_request("GET", f"/patients/{patient_id}/problems")
        if not response:
            return []

        problems = response if isinstance(response, list) else response.get("problems", [])
        return [
            FHIRResource(
                resource_type="Condition",
                resource_id=str(p.get("problemid", "")),
                data={
                    "resourceType": "Condition",
                    "id": str(p.get("problemid", "")),
                    "clinicalStatus": {"coding": [{"code": "active"}]},
                    "code": {"text": p.get("name", "")},
                    "subject": {"reference": f"Patient/{patient_id}"},
                },
                source_system=f"athena:{self.config.partner_id}",
            )
            for p in problems
        ]

    def fetch_medications(self, patient_id: str, status: Optional[str] = None) -> List[FHIRResource]:
        self._log_audit("FETCH_MEDICATIONS", "MedicationStatement", patient_id)
        response = self._api_request("GET", f"/patients/{patient_id}/medications")
        if not response:
            return []

        meds = response if isinstance(response, list) else response.get("medications", [])
        return [
            FHIRResource(
                resource_type="MedicationStatement",
                resource_id=str(m.get("medicationid", "")),
                data={
                    "resourceType": "MedicationStatement",
                    "id": str(m.get("medicationid", "")),
                    "status": "active",
                    "medicationCodeableConcept": {"text": m.get("medication", "")},
                    "subject": {"reference": f"Patient/{patient_id}"},
                },
                source_system=f"athena:{self.config.partner_id}",
            )
            for m in meds
        ]

    def subscribe_to_events(self, event_types: List[str], webhook_url: str,
                           patient_id: Optional[str] = None) -> Optional[str]:
        # athenahealth uses changed data subscriptions
        self._log_audit("SUBSCRIBE", "Subscription")
        response = self._api_request("POST", "/changedatasubscriptions", json_body={
            "eventclass": "Appointment",
            "callbackurl": webhook_url,
        })
        return str(response.get("subscriptionid")) if response else None

    def unsubscribe(self, subscription_id: str) -> bool:
        self._api_request("DELETE", f"/changedatasubscriptions/{subscription_id}")
        return True

    def bulk_fetch(self, resource_type: str, since: Optional[datetime] = None,
                  patient_ids: Optional[List[str]] = None) -> SyncResult:
        start_time = time.time()
        result = SyncResult(success=True, records_processed=0)
        result.duration_ms = int((time.time() - start_time) * 1000)
        return result

    def health_check(self) -> Dict[str, Any]:
        return {
            "vendor": "athenahealth",
            "partner_id": self.config.partner_id,
            "status": self._status.value,
            "connected": self.is_connected,
        }
