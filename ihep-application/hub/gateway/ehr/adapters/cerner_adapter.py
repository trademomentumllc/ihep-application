"""
Cerner (Oracle Health) EHR Adapter

OAuth 2.0 + FHIR R4 integration with Cerner Code program.

Cerner Market Share: ~25% of hospital EHR market
Now part of Oracle Health

Requirements:
- Cerner Code registration
- App validation through Cerner Code Console
- Production credentials from each healthcare system

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


class CernerAdapter(BaseEHRAdapter):
    """
    Cerner/Oracle Health adapter using OAuth 2.0 + FHIR R4.

    Authentication: OAuth 2.0 (authorization code or client credentials)
    API Version: FHIR R4 (Millennium platform)

    Cerner-specific considerations:
    - Uses 'system' scope for backend services
    - Supports CDS Hooks for clinical decision support
    - Different auth flows for patient vs system access
    """

    FHIR_VERSION = "R4"
    METADATA_PATH = "/metadata"

    DEFAULT_SCOPES = [
        "patient/Patient.read",
        "patient/Observation.read",
        "patient/Appointment.read",
        "patient/Condition.read",
        "patient/CarePlan.read",
        "patient/MedicationStatement.read",
        "system/Patient.read",
        "system/Observation.read",
    ]

    def __init__(
        self,
        config: AdapterConfig,
        audit_logger: Optional[Callable] = None
    ):
        super().__init__(config, audit_logger)

        if not config.base_url:
            raise ValueError("Cerner base_url is required")
        if not config.client_id:
            raise ValueError("Cerner client_id is required")

        if not config.scopes:
            config.scopes = self.DEFAULT_SCOPES

        self._refresh_token: Optional[str] = None
        self._token_url: Optional[str] = None
        self._auth_url: Optional[str] = None

    def _discover_endpoints(self) -> bool:
        """Discover OAuth endpoints from FHIR metadata."""
        try:
            metadata_url = f"{self.config.base_url}{self.METADATA_PATH}"
            response = requests.get(
                metadata_url,
                headers={"Accept": "application/fhir+json"},
                timeout=self.config.timeout_seconds
            )
            response.raise_for_status()

            metadata = response.json()

            for rest in metadata.get("rest", []):
                security = rest.get("security", {})
                for extension in security.get("extension", []):
                    if "oauth-uris" in extension.get("url", ""):
                        for ext in extension.get("extension", []):
                            if ext.get("url") == "authorize":
                                self._auth_url = ext.get("valueUri")
                            elif ext.get("url") == "token":
                                self._token_url = ext.get("valueUri")

            return bool(self._auth_url and self._token_url)

        except requests.RequestException as e:
            logger.error(f"Failed to discover Cerner endpoints: {e}")
            return False

    def authenticate(self, authorization_code: Optional[str] = None, redirect_uri: Optional[str] = None) -> bool:
        """Authenticate with Cerner using OAuth 2.0."""
        self._status = ConnectionStatus.CONNECTING

        try:
            if not self._token_url:
                if not self._discover_endpoints():
                    self._status = ConnectionStatus.ERROR
                    return False

            # Client credentials flow for backend services
            data = {
                "grant_type": "client_credentials",
                "scope": " ".join(self.config.scopes),
            }

            headers = {"Content-Type": "application/x-www-form-urlencoded"}

            if self.config.client_secret:
                credentials = base64.b64encode(
                    f"{self.config.client_id}:{self.config.client_secret}".encode()
                ).decode()
                headers["Authorization"] = f"Basic {credentials}"
            else:
                data["client_id"] = self.config.client_id

            response = requests.post(
                self._token_url,
                data=data,
                headers=headers,
                timeout=self.config.timeout_seconds
            )

            if response.status_code != 200:
                logger.error(f"Cerner auth failed: {response.status_code}")
                self._status = ConnectionStatus.ERROR
                return False

            token_data = response.json()
            self._access_token = token_data.get("access_token")
            self._refresh_token = token_data.get("refresh_token")

            expires_in = token_data.get("expires_in", 3600)
            self._token_expiry = datetime.utcnow() + timedelta(seconds=expires_in - 60)

            self._status = ConnectionStatus.CONNECTED
            self._log_audit("AUTHENTICATE", "OAuth", success=True)

            logger.info(f"Authenticated with Cerner: {self.config.partner_id}")
            return True

        except Exception as e:
            logger.error(f"Cerner authentication failed: {e}")
            self._status = ConnectionStatus.ERROR
            return False

    def refresh_token(self) -> bool:
        """Refresh Cerner access token."""
        if not self._refresh_token:
            return self.authenticate()

        try:
            data = {
                "grant_type": "refresh_token",
                "refresh_token": self._refresh_token,
            }

            headers = {"Content-Type": "application/x-www-form-urlencoded"}
            if self.config.client_secret:
                credentials = base64.b64encode(
                    f"{self.config.client_id}:{self.config.client_secret}".encode()
                ).decode()
                headers["Authorization"] = f"Basic {credentials}"

            response = requests.post(
                self._token_url,
                data=data,
                headers=headers,
                timeout=self.config.timeout_seconds
            )

            if response.status_code != 200:
                return False

            token_data = response.json()
            self._access_token = token_data.get("access_token")
            self._refresh_token = token_data.get("refresh_token", self._refresh_token)

            expires_in = token_data.get("expires_in", 3600)
            self._token_expiry = datetime.utcnow() + timedelta(seconds=expires_in - 60)

            return True

        except Exception as e:
            logger.error(f"Cerner token refresh failed: {e}")
            return False

    def _ensure_authenticated(self) -> None:
        """Ensure valid access token."""
        if not self._access_token:
            raise ConnectionError("Not authenticated with Cerner")

        if self._token_expiry and datetime.utcnow() >= self._token_expiry:
            if not self.refresh_token():
                raise ConnectionError("Failed to refresh Cerner token")

    def _fhir_request(
        self,
        method: str,
        path: str,
        params: Optional[Dict] = None,
        json_body: Optional[Dict] = None
    ) -> Optional[Dict[str, Any]]:
        """Make authenticated FHIR request to Cerner."""
        self._ensure_authenticated()

        url = f"{self.config.base_url}{path}"
        headers = {
            "Authorization": f"Bearer {self._access_token}",
            "Accept": "application/fhir+json",
            "Content-Type": "application/fhir+json",
        }

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                json=json_body,
                timeout=self.config.timeout_seconds
            )

            if response.status_code == 429:
                self._status = ConnectionStatus.RATE_LIMITED
                return None

            if response.status_code == 401:
                if self.refresh_token():
                    return self._fhir_request(method, path, params, json_body)
                return None

            if response.status_code >= 400:
                logger.error(f"Cerner request failed: {response.status_code}")
                return None

            return response.json() if response.content else {}

        except requests.RequestException as e:
            logger.error(f"Cerner request error: {e}")
            return None

    def _parse_bundle(self, bundle: Dict, resource_type: str) -> List[FHIRResource]:
        """Parse FHIR Bundle."""
        resources = []
        for entry in bundle.get("entry", []):
            resource = entry.get("resource", {})
            if resource.get("resourceType") == resource_type:
                resources.append(FHIRResource(
                    resource_type=resource_type,
                    resource_id=resource.get("id", ""),
                    data=resource,
                    source_system=f"cerner:{self.config.partner_id}",
                ))
        return resources

    # === FHIR Operations (same interface as Epic) ===

    def fetch_patient(self, patient_id: str) -> Optional[FHIRResource]:
        self._log_audit("FETCH_PATIENT", "Patient", patient_id)
        response = self._fhir_request("GET", f"/Patient/{patient_id}")
        if not response:
            return None
        return FHIRResource(
            resource_type="Patient",
            resource_id=response.get("id", patient_id),
            data=response,
            source_system=f"cerner:{self.config.partner_id}",
        )

    def search_patients(
        self,
        family_name: Optional[str] = None,
        given_name: Optional[str] = None,
        birthdate: Optional[str] = None,
        identifier: Optional[str] = None,
        limit: int = 100
    ) -> List[FHIRResource]:
        params = {"_count": min(limit, 100)}
        if family_name:
            params["family"] = family_name
        if given_name:
            params["given"] = given_name
        if birthdate:
            params["birthdate"] = birthdate
        if identifier:
            params["identifier"] = identifier

        self._log_audit("SEARCH_PATIENTS", "Patient", details={"params": params})
        response = self._fhir_request("GET", "/Patient", params=params)
        return self._parse_bundle(response, "Patient") if response else []

    def fetch_observations(
        self,
        patient_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
        codes: Optional[List[str]] = None,
        limit: int = 100
    ) -> List[FHIRResource]:
        params = {"patient": patient_id, "_count": min(limit, 100)}
        if start_date:
            params["date"] = f"ge{start_date}"
        if category:
            params["category"] = category
        if codes:
            params["code"] = ",".join(codes)

        self._log_audit("FETCH_OBSERVATIONS", "Observation", patient_id)
        response = self._fhir_request("GET", "/Observation", params=params)
        return self._parse_bundle(response, "Observation") if response else []

    def push_observation(self, patient_id: str, observation: Dict[str, Any]) -> Optional[str]:
        observation["subject"] = {"reference": f"Patient/{patient_id}"}
        self._log_audit("PUSH_OBSERVATION", "Observation", patient_id)
        response = self._fhir_request("POST", "/Observation", json_body=observation)
        return response.get("id") if response else None

    def fetch_appointments(
        self,
        patient_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[FHIRResource]:
        params = {"patient": patient_id, "_count": min(limit, 100)}
        if start_date:
            params["date"] = f"ge{start_date}"
        if status:
            params["status"] = status

        self._log_audit("FETCH_APPOINTMENTS", "Appointment", patient_id)
        response = self._fhir_request("GET", "/Appointment", params=params)
        return self._parse_bundle(response, "Appointment") if response else []

    def create_appointment(self, appointment: Dict[str, Any]) -> Optional[str]:
        self._log_audit("CREATE_APPOINTMENT", "Appointment")
        response = self._fhir_request("POST", "/Appointment", json_body=appointment)
        return response.get("id") if response else None

    def fetch_care_plans(
        self,
        patient_id: str,
        status: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[FHIRResource]:
        params = {"patient": patient_id}
        if status:
            params["status"] = status

        self._log_audit("FETCH_CARE_PLANS", "CarePlan", patient_id)
        response = self._fhir_request("GET", "/CarePlan", params=params)
        return self._parse_bundle(response, "CarePlan") if response else []

    def fetch_conditions(
        self,
        patient_id: str,
        clinical_status: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[FHIRResource]:
        params = {"patient": patient_id}
        if clinical_status:
            params["clinical-status"] = clinical_status

        self._log_audit("FETCH_CONDITIONS", "Condition", patient_id)
        response = self._fhir_request("GET", "/Condition", params=params)
        return self._parse_bundle(response, "Condition") if response else []

    def fetch_medications(
        self,
        patient_id: str,
        status: Optional[str] = None
    ) -> List[FHIRResource]:
        params = {"patient": patient_id}
        if status:
            params["status"] = status

        self._log_audit("FETCH_MEDICATIONS", "MedicationStatement", patient_id)
        response = self._fhir_request("GET", "/MedicationStatement", params=params)
        return self._parse_bundle(response, "MedicationStatement") if response else []

    def subscribe_to_events(
        self,
        event_types: List[str],
        webhook_url: str,
        patient_id: Optional[str] = None
    ) -> Optional[str]:
        """Cerner subscription via FHIR Subscription resource."""
        subscription = {
            "resourceType": "Subscription",
            "status": "requested",
            "reason": "IHEP integration",
            "channel": {
                "type": "rest-hook",
                "endpoint": webhook_url,
                "payload": "application/fhir+json",
            },
            "criteria": "Patient?",
        }

        self._log_audit("SUBSCRIBE", "Subscription", details={"event_types": event_types})
        response = self._fhir_request("POST", "/Subscription", json_body=subscription)
        return response.get("id") if response else None

    def unsubscribe(self, subscription_id: str) -> bool:
        self._log_audit("UNSUBSCRIBE", "Subscription", subscription_id)
        response = self._fhir_request("DELETE", f"/Subscription/{subscription_id}")
        return response is not None

    def bulk_fetch(
        self,
        resource_type: str,
        since: Optional[datetime] = None,
        patient_ids: Optional[List[str]] = None
    ) -> SyncResult:
        """Bulk fetch from Cerner."""
        start_time = time.time()
        result = SyncResult(success=False)

        try:
            params = {"_count": 1000}
            if since:
                params["_lastUpdated"] = f"ge{since.isoformat()}Z"

            response = self._fhir_request("GET", f"/{resource_type}", params=params)
            if response:
                resources = self._parse_bundle(response, resource_type)
                result.records_processed = len(resources)
                result.records_created = len(resources)
                result.success = True

        except Exception as e:
            result.errors.append(str(e))

        result.duration_ms = int((time.time() - start_time) * 1000)
        return result

    def health_check(self) -> Dict[str, Any]:
        """Check Cerner connection health."""
        result = {
            "vendor": "cerner",
            "partner_id": self.config.partner_id,
            "status": self._status.value,
            "connected": self.is_connected,
            "token_valid": bool(self._access_token and self._token_expiry and datetime.utcnow() < self._token_expiry),
        }

        try:
            start = time.time()
            response = requests.get(
                f"{self.config.base_url}{self.METADATA_PATH}",
                headers={"Accept": "application/fhir+json"},
                timeout=10
            )
            result["latency_ms"] = int((time.time() - start) * 1000)
            result["metadata_accessible"] = response.status_code == 200
        except Exception as e:
            result["error"] = str(e)

        return result
