# Terraform configuration
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.84"
    }
  }
}

# Variables
variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "ihep-app"
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}