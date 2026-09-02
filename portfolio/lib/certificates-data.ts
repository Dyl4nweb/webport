import {
  certificates as staticCertificates,
  type Certificate,
} from "@/data/certificates";

/**
 * All certificates loaded directly from the local codebase (data/certificates.ts).
 * 100% reliable, instantaneous, and completely independent of any external database.
 */
export async function getCertificates(): Promise<Certificate[]> {
  return staticCertificates;
}
