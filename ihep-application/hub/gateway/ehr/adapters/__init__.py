"""
IHEP EHR Adapters Package

Provides standardized interfaces for connecting to major EHR systems:
- Epic (SMART on FHIR)
- Cerner (OAuth 2.0 + FHIR)
- Allscripts (API Key)
- athenahealth (OAuth 2.0)
- Generic FHIR R4
- HL7 v2.x (legacy)

Author: Jason M Jarmacz | Evolution Strategist | jason@ihep.app
Co-Author: Claude by Anthropic
"""

from .base_adapter import BaseEHRAdapter, EHRAdapterRegistry
from .epic_adapter import EpicAdapter
from .cerner_adapter import CernerAdapter
from .allscripts_adapter import AllscriptsAdapter
from .athena_adapter import AthenaAdapter
from .hl7v2_adapter import HL7v2Adapter

__all__ = [
    'BaseEHRAdapter',
    'EHRAdapterRegistry',
    'EpicAdapter',
    'CernerAdapter',
    'AllscriptsAdapter',
    'AthenaAdapter',
    'HL7v2Adapter',
]

# Adapter registry for dynamic loading
ADAPTER_REGISTRY = {
    'epic': EpicAdapter,
    'cerner': CernerAdapter,
    'allscripts': AllscriptsAdapter,
    'athena': AthenaAdapter,
    'athenahealth': AthenaAdapter,
    'hl7v2': HL7v2Adapter,
    'hl7_v2': HL7v2Adapter,
}


def get_adapter(vendor: str) -> type:
    """
    Get adapter class by vendor name.

    Args:
        vendor: EHR vendor identifier (epic, cerner, allscripts, athena, hl7v2)

    Returns:
        Adapter class for the specified vendor

    Raises:
        ValueError: If vendor is not supported
    """
    vendor_lower = vendor.lower().replace('-', '_').replace(' ', '_')
    if vendor_lower not in ADAPTER_REGISTRY:
        supported = ', '.join(ADAPTER_REGISTRY.keys())
        raise ValueError(f"Unsupported EHR vendor: {vendor}. Supported: {supported}")
    return ADAPTER_REGISTRY[vendor_lower]
