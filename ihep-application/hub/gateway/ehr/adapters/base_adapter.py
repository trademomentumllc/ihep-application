"""
Base EHR Adapter Interface

Abstract base class defining the contract for all EHR vendor adapters.
Implements the Adapter pattern for healthcare interoperability.

Mathematical Properties:
- Idempotency: fetch_* operations return consistent results for same inputs
- Audit Completeness: P(logged | PHI_access) = 1.0

Author: Jason M Jarmacz | Evolution Strategist | jason@ihep.app
Co-Author: Claude by Anthropic
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Callable
import logging
import hashlib
import uuid

logger = logging.getLogger(__name__)


class EHRVendor(Enum):
    """Supported EHR vendors."""
    EPIC = "epic"
    CERNER = "cerner"
    ALLSCRIPTS = "allscripts"
    ATHENA = "athena"
    GENERIC_FHIR = "generic_fhir"
    HL7V2 = "hl7v2"


class ConnectionStatus(Enum):
    """Adapter connection status."""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    ERROR = "error"
    RATE_LIMITED = "rate_limited"


class SyncDirection(Enum):
    """Data synchronization direction."""
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    BIDIRECTIONAL = "bidirectional"


@dataclass
class AdapterConfig:
    """Configuration for EHR adapter."""
    partner_id: str
    vendor: EHRVendor
    base_url: str
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    api_key: Optional[str] = None
    scopes: List[str] = field(default_factory=list)
    sync_direction: SyncDirection = SyncDirection.BIDIRECTIONAL
    webhook_url: Optional[str] = None
    rate_limit_per_minute: int = 100
    timeout_seconds: int = 30
    retry_attempts: int = 3
    custom_headers: Dict[str, str] = field(default_factory=dict)
    field_mappings: Dict[str, str] = field(default_factory=dict)


@dataclass
class FHIRResource:
    """Wrapper for FHIR resources with metadata."""
    resource_type: str
    resource_id: str
    data: Dict[str, Any]
    source_system: str
    retrieved_at: datetime = field(default_factory=datetime.utcnow)
    version_id: Optional[str] = None
    last_updated: Optional[datetime] = None


@dataclass
class SyncResult:
    """Result of a sync operation."""
    success: bool
    records_processed: int = 0
    records_created: int = 0
    records_updated: int = 0
    records_failed: int = 0
    errors: List[str] = field(default_factory=list)
    duration_ms: int = 0
    sync_token: Optional[str] = None


class BaseEHRAdapter(ABC):
    """
    Abstract base class for EHR adapters.

    All vendor-specific adapters must implement this interface to ensure
    consistent behavior across different EHR systems.

    Design Principles:
    - Single Responsibility: Each adapter handles one EHR vendor
    - Open/Closed: New vendors added via new adapter classes
    - Liskov Substitution: All adapters interchangeable via base interface
    - Interface Segregation: Methods grouped by capability
    - Dependency Inversion: Adapters depend on abstractions (FHIR)
    """

    def __init__(self, config: AdapterConfig, audit_logger: Optional[Callable] = None):
        """
        Initialize adapter with configuration.

        Args:
            config: Adapter configuration with credentials and settings
            audit_logger: Optional callback for audit logging
        """
        self.config = config
        self.audit_logger = audit_logger
        self._status = ConnectionStatus.DISCONNECTED
        self._access_token: Optional[str] = None
        self._token_expiry: Optional[datetime] = None
        self._session_id = str(uuid.uuid4())[:12]

    @property
    def status(self) -> ConnectionStatus:
        """Get current connection status."""
        return self._status

    @property
    def is_connected(self) -> bool:
        """Check if adapter is connected and authenticated."""
        return self._status == ConnectionStatus.CONNECTED

    def _hash_identifier(self, value: str) -> str:
        """Create audit-safe hash of identifier."""
        return hashlib.sha256(f"{self.config.partner_id}:{value}".encode()).hexdigest()[:12]

    def _log_audit(
        self,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        success: bool = True,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log audit event for PHI access."""
        if self.audit_logger:
            self.audit_logger(
                partner_id=self.config.partner_id,
                vendor=self.config.vendor.value,
                action=action,
                resource_type=resource_type,
                resource_id_hash=self._hash_identifier(resource_id) if resource_id else None,
                success=success,
                details=details or {},
                session_id=self._session_id,
                timestamp=datetime.utcnow().isoformat()
            )

    # === Authentication Methods ===

    @abstractmethod
    def authenticate(self) -> bool:
        """
        Establish authenticated connection with EHR system.

        Returns:
            True if authentication successful, False otherwise

        Raises:
            ConnectionError: If unable to reach EHR system
            AuthenticationError: If credentials are invalid
        """
        pass

    @abstractmethod
    def refresh_token(self) -> bool:
        """
        Refresh OAuth access token if expired.

        Returns:
            True if token refreshed successfully
        """
        pass

    def disconnect(self) -> None:
        """Close connection and clear credentials."""
        self._access_token = None
        self._token_expiry = None
        self._status = ConnectionStatus.DISCONNECTED
        logger.info(f"Disconnected from {self.config.vendor.value}")

    # === Patient Operations ===

    @abstractmethod
    def fetch_patient(self, patient_id: str) -> Optional[FHIRResource]:
        """
        Retrieve patient demographics by ID.

        Args:
            patient_id: Patient identifier (MRN or FHIR ID)

        Returns:
            FHIR Patient resource or None if not found
        """
        pass

    @abstractmethod
    def search_patients(
        self,
        family_name: Optional[str] = None,
        given_name: Optional[str] = None,
        birthdate: Optional[str] = None,
        identifier: Optional[str] = None,
        limit: int = 100
    ) -> List[FHIRResource]:
        """
        Search for patients matching criteria.

        Args:
            family_name: Patient last name
            given_name: Patient first name
            birthdate: Date of birth (YYYY-MM-DD)
            identifier: MRN or other identifier
            limit: Maximum results to return

        Returns:
            List of matching FHIR Patient resources
        """
        pass

    # === Observation Operations ===

    @abstractmethod
    def fetch_observations(
        self,
        patient_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
        codes: Optional[List[str]] = None,
        limit: int = 100
    ) -> List[FHIRResource]:
        """
        Retrieve patient observations/vitals.

        Args:
            patient_id: Patient identifier
            start_date: Start of date range (YYYY-MM-DD)
            end_date: End of date range (YYYY-MM-DD)
            category: Observation category (vital-signs, laboratory, etc.)
            codes: List of LOINC codes to filter by
            limit: Maximum results

        Returns:
            List of FHIR Observation resources
        """
        pass

    @abstractmethod
    def push_observation(
        self,
        patient_id: str,
        observation: Dict[str, Any]
    ) -> Optional[str]:
        """
        Write observation back to EHR.

        Args:
            patient_id: Patient identifier
            observation: FHIR Observation resource

        Returns:
            Created resource ID or None if failed
        """
        pass

    # === Appointment Operations ===

    @abstractmethod
    def fetch_appointments(
        self,
        patient_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[FHIRResource]:
        """
        Retrieve patient appointments.

        Args:
            patient_id: Patient identifier
            start_date: Start of date range
            end_date: End of date range
            status: Appointment status filter
            limit: Maximum results

        Returns:
            List of FHIR Appointment resources
        """
        pass

    @abstractmethod
    def create_appointment(
        self,
        appointment: Dict[str, Any]
    ) -> Optional[str]:
        """
        Create new appointment in EHR.

        Args:
            appointment: FHIR Appointment resource

        Returns:
            Created appointment ID or None if failed
        """
        pass

    # === Care Plan Operations ===

    @abstractmethod
    def fetch_care_plans(
        self,
        patient_id: str,
        status: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[FHIRResource]:
        """
        Retrieve patient care plans.

        Args:
            patient_id: Patient identifier
            status: Care plan status (active, completed, etc.)
            category: Care plan category

        Returns:
            List of FHIR CarePlan resources
        """
        pass

    # === Condition/Problem List Operations ===

    @abstractmethod
    def fetch_conditions(
        self,
        patient_id: str,
        clinical_status: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[FHIRResource]:
        """
        Retrieve patient conditions/problem list.

        Args:
            patient_id: Patient identifier
            clinical_status: active, recurrence, relapse, etc.
            category: problem-list-item, encounter-diagnosis

        Returns:
            List of FHIR Condition resources
        """
        pass

    # === Medication Operations ===

    @abstractmethod
    def fetch_medications(
        self,
        patient_id: str,
        status: Optional[str] = None
    ) -> List[FHIRResource]:
        """
        Retrieve patient medications.

        Args:
            patient_id: Patient identifier
            status: active, completed, stopped, etc.

        Returns:
            List of FHIR MedicationStatement resources
        """
        pass

    # === Webhook/Subscription Operations ===

    @abstractmethod
    def subscribe_to_events(
        self,
        event_types: List[str],
        webhook_url: str,
        patient_id: Optional[str] = None
    ) -> Optional[str]:
        """
        Set up real-time event subscriptions.

        Args:
            event_types: List of event types (patient-create, observation-create, etc.)
            webhook_url: URL to receive webhook callbacks
            patient_id: Optional patient ID to filter events

        Returns:
            Subscription ID or None if failed
        """
        pass

    @abstractmethod
    def unsubscribe(self, subscription_id: str) -> bool:
        """
        Remove event subscription.

        Args:
            subscription_id: ID of subscription to remove

        Returns:
            True if successfully unsubscribed
        """
        pass

    # === Bulk Operations ===

    @abstractmethod
    def bulk_fetch(
        self,
        resource_type: str,
        since: Optional[datetime] = None,
        patient_ids: Optional[List[str]] = None
    ) -> SyncResult:
        """
        Bulk fetch resources for initial sync or catch-up.

        Args:
            resource_type: FHIR resource type to fetch
            since: Only fetch records modified since this time
            patient_ids: Optional list of patient IDs to filter

        Returns:
            SyncResult with statistics
        """
        pass

    # === Health Check ===

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """
        Check adapter and EHR system health.

        Returns:
            Health status including connection, latency, and capabilities
        """
        pass


class EHRAdapterRegistry:
    """
    Registry for managing multiple EHR adapter instances.

    Provides centralized access to adapters by partner ID.
    """

    def __init__(self):
        self._adapters: Dict[str, BaseEHRAdapter] = {}

    def register(self, adapter: BaseEHRAdapter) -> None:
        """Register adapter instance."""
        self._adapters[adapter.config.partner_id] = adapter
        logger.info(f"Registered adapter for partner: {adapter.config.partner_id}")

    def get(self, partner_id: str) -> Optional[BaseEHRAdapter]:
        """Get adapter by partner ID."""
        return self._adapters.get(partner_id)

    def list_partners(self) -> List[str]:
        """List all registered partner IDs."""
        return list(self._adapters.keys())

    def health_check_all(self) -> Dict[str, Dict[str, Any]]:
        """Run health check on all registered adapters."""
        results = {}
        for partner_id, adapter in self._adapters.items():
            try:
                results[partner_id] = adapter.health_check()
            except Exception as e:
                results[partner_id] = {
                    'status': 'error',
                    'error': str(e)
                }
        return results
