"""
Allscripts EHR Adapter

API Key based authentication with FHIR R4 support.

Author: Jason M Jarmacz | Evolution Strategist | jason@ihep.app
Co-Author: Claude by Anthropic
"""

import logging
import time
from datetime import datetime
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


class AllscriptsAdapter(BaseEHRAdapter):
    """
    Allscripts adapter using API Key authentication.

    Allscripts supports both:
    - Unity API (proprietary)
    - FHIR R4 (newer implementations)
    """

    FHIR_VERSION = "R4"

    def __init__(self, config: AdapterConfig, audit_logger: Optional[Callable] = None):
        super().__init__(config, audit_logger)

        if not config.base_url:
            raise ValueError("Allscripts base_url is required")
        if not config.api_key:
            raise ValueError("Allscripts api_key is required")

    def authenticate(self, authorization_code: Optional[str] = None, redirect_uri: Optional[str] = None) -> bool:
        """Verify API key with Allscripts."""
        self._status = ConnectionStatus.CONNECTING

        try:
            # Test API key with metadata endpoint
            response = requests.get(
                f"{self.config.base_url}/metadata",
                headers={
                    "Accept": "application/fhir+json",
                    "X-API-Key": self.config.api_key,
                },
                timeout=self.config.timeout_seconds
            )

            if response.status_code == 200:
                self._access_token = self.config.api_key
                self._status = ConnectionStatus.CONNECTED
                self._log_audit("AUTHENTICATE", "APIKey", success=True)
                return True

            self._status = ConnectionStatus.ERROR
            return False

        except Exception as e:
            logger.error(f"Allscripts auth failed: {e}")
            self._status = ConnectionStatus.ERROR
            return False

    def refresh_token(self) -> bool:
        """API key doesn't expire - re-verify."""
        return self.authenticate()

    def _fhir_request(
        self,
        method: str,
        path: str,
        params: Optional[Dict] = None,
        json_body: Optional[Dict] = None
    ) -> Optional[Dict[str, Any]]:
        """Make FHIR request with API key."""
        if not self._access_token:
            raise ConnectionError("Not authenticated with Allscripts")

        url = f"{self.config.base_url}{path}"
        headers = {
            "X-API-Key": self._access_token,
            "Accept": "application/fhir+json",
            "Content-Type": "application/fhir+json",
        }

        try:
            response = requests.request(
                method=method, url=url, headers=headers,
                params=params, json=json_body, timeout=self.config.timeout_seconds
            )

            if response.status_code >= 400:
                logger.error(f"Allscripts request failed: {response.status_code}")
                return None

            return response.json() if response.content else {}

        except requests.RequestException as e:
            logger.error(f"Allscripts request error: {e}")
            return None

    def _parse_bundle(self, bundle: Dict, resource_type: str) -> List[FHIRResource]:
        resources = []
        for entry in bundle.get("entry", []):
            resource = entry.get("resource", {})
            if resource.get("resourceType") == resource_type:
                resources.append(FHIRResource(
                    resource_type=resource_type,
                    resource_id=resource.get("id", ""),
                    data=resource,
                    source_system=f"allscripts:{self.config.partner_id}",
                ))
        return resources

    # Standard FHIR operations - same pattern as other adapters

    def fetch_patient(self, patient_id: str) -> Optional[FHIRResource]:
        self._log_audit("FETCH_PATIENT", "Patient", patient_id)
        response = self._fhir_request("GET", f"/Patient/{patient_id}")
        if not response:
            return None
        return FHIRResource(
            resource_type="Patient", resource_id=response.get("id", patient_id),
            data=response, source_system=f"allscripts:{self.config.partner_id}"
        )

    def search_patients(self, family_name: Optional[str] = None, given_name: Optional[str] = None,
                       birthdate: Optional[str] = None, identifier: Optional[str] = None,
                       limit: int = 100) -> List[FHIRResource]:
        params = {"_count": min(limit, 100)}
        if family_name: params["family"] = family_name
        if given_name: params["given"] = given_name
        if birthdate: params["birthdate"] = birthdate
        if identifier: params["identifier"] = identifier
        self._log_audit("SEARCH_PATIENTS", "Patient")
        response = self._fhir_request("GET", "/Patient", params=params)
        return self._parse_bundle(response, "Patient") if response else []

    def fetch_observations(self, patient_id: str, start_date: Optional[str] = None,
                          end_date: Optional[str] = None, category: Optional[str] = None,
                          codes: Optional[List[str]] = None, limit: int = 100) -> List[FHIRResource]:
        params = {"patient": patient_id, "_count": min(limit, 100)}
        if category: params["category"] = category
        self._log_audit("FETCH_OBSERVATIONS", "Observation", patient_id)
        response = self._fhir_request("GET", "/Observation", params=params)
        return self._parse_bundle(response, "Observation") if response else []

    def push_observation(self, patient_id: str, observation: Dict[str, Any]) -> Optional[str]:
        observation["subject"] = {"reference": f"Patient/{patient_id}"}
        self._log_audit("PUSH_OBSERVATION", "Observation", patient_id)
        response = self._fhir_request("POST", "/Observation", json_body=observation)
        return response.get("id") if response else None

    def fetch_appointments(self, patient_id: str, start_date: Optional[str] = None,
                          end_date: Optional[str] = None, status: Optional[str] = None,
                          limit: int = 100) -> List[FHIRResource]:
        params = {"patient": patient_id, "_count": min(limit, 100)}
        self._log_audit("FETCH_APPOINTMENTS", "Appointment", patient_id)
        response = self._fhir_request("GET", "/Appointment", params=params)
        return self._parse_bundle(response, "Appointment") if response else []

    def create_appointment(self, appointment: Dict[str, Any]) -> Optional[str]:
        self._log_audit("CREATE_APPOINTMENT", "Appointment")
        response = self._fhir_request("POST", "/Appointment", json_body=appointment)
        return response.get("id") if response else None

    def fetch_care_plans(self, patient_id: str, status: Optional[str] = None,
                        category: Optional[str] = None) -> List[FHIRResource]:
        params = {"patient": patient_id}
        self._log_audit("FETCH_CARE_PLANS", "CarePlan", patient_id)
        response = self._fhir_request("GET", "/CarePlan", params=params)
        return self._parse_bundle(response, "CarePlan") if response else []

    def fetch_conditions(self, patient_id: str, clinical_status: Optional[str] = None,
                        category: Optional[str] = None) -> List[FHIRResource]:
        params = {"patient": patient_id}
        self._log_audit("FETCH_CONDITIONS", "Condition", patient_id)
        response = self._fhir_request("GET", "/Condition", params=params)
        return self._parse_bundle(response, "Condition") if response else []

    def fetch_medications(self, patient_id: str, status: Optional[str] = None) -> List[FHIRResource]:
        params = {"patient": patient_id}
        self._log_audit("FETCH_MEDICATIONS", "MedicationStatement", patient_id)
        response = self._fhir_request("GET", "/MedicationStatement", params=params)
        return self._parse_bundle(response, "MedicationStatement") if response else []

    def subscribe_to_events(self, event_types: List[str], webhook_url: str,
                           patient_id: Optional[str] = None) -> Optional[str]:
        # Allscripts subscription support varies
        logger.warning("Allscripts subscriptions may not be supported")
        return None

    def unsubscribe(self, subscription_id: str) -> bool:
        return True

    def bulk_fetch(self, resource_type: str, since: Optional[datetime] = None,
                  patient_ids: Optional[List[str]] = None) -> SyncResult:
        start_time = time.time()
        result = SyncResult(success=False)
        try:
            response = self._fhir_request("GET", f"/{resource_type}", params={"_count": 1000})
            if response:
                resources = self._parse_bundle(response, resource_type)
                result.records_processed = len(resources)
                result.success = True
        except Exception as e:
            result.errors.append(str(e))
        result.duration_ms = int((time.time() - start_time) * 1000)
        return result

    def health_check(self) -> Dict[str, Any]:
        return {
            "vendor": "allscripts",
            "partner_id": self.config.partner_id,
            "status": self._status.value,
            "connected": self.is_connected,
        }
