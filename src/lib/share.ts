import LZString from "lz-string";

export interface SharedWorkspace {
  html: string;
  css: string;
  typescript: string;
}

const SHARE_PARAM = "code";

export function encodeWorkspace(workspace: SharedWorkspace): string {
  const json = JSON.stringify(workspace);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeWorkspace(encoded: string): SharedWorkspace | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (
      typeof parsed.html === "string" &&
      typeof parsed.css === "string" &&
      typeof parsed.typescript === "string"
    ) {
      return parsed as SharedWorkspace;
    }
    return null;
  } catch {
    return null;
  }
}

export function getShareUrl(workspace: SharedWorkspace): string {
  const encoded = encodeWorkspace(workspace);
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set(SHARE_PARAM, encoded);
  return url.toString();
}

export function getWorkspaceFromUrl(): SharedWorkspace | null {
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get(SHARE_PARAM);
  if (!encoded) return null;
  return decodeWorkspace(encoded);
}

export async function copyShareUrl(workspace: SharedWorkspace): Promise<boolean> {
  try {
    const url = getShareUrl(workspace);
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
