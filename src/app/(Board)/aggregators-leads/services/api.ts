const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function callApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${
    path.startsWith("/") ? path : `/${path}`
  }`;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers,
  });

  const text = await res.text().catch(() => "");
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!res.ok) {
    const message =
      payload?.message || payload?.error || res.statusText || "API error";
    const err: any = new Error(message);
    err.status = res.status;
    err.body = payload;
    throw err;
  }

  return payload;
}

export async function findUserByPhone(phone: string) {
  try {
    const res = await callApi(`/users?search=${encodeURIComponent(phone)}`, {
      method: "GET",
    });
    if (Array.isArray(res) && res.length > 0) return res[0];
    if (res?.data?.length) return res.data[0];
    return null;
  } catch (err) {
    console.error("Failed to find user by phone:", err);
    return null;
  }
}

export async function createAggregatorLead(body: Record<string, any>) {
  return await callApi(`/aggregator-leads`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function patchAggregatorLead(
  id: string,
  body: Record<string, any>
) {
  return await callApi(`/aggregator-leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAggregatorLead(id: string) {
  return await callApi(`/aggregator-leads/${id}`, { method: "DELETE" });
}

export async function fetchAllCompanies() {
  try {
    const res = await callApi(`/po-companies`, { method: "GET" });
    const companies = Array.isArray(res) ? res : res.data || [];

    // Transform companies to include concatenated name + address
    const transformedCompanies = companies.map((company: any) => ({
      id: company.id,
      name: company.name, // Keep original name
      displayName:
        company.taluk && company.district
          ? `${company.name} - ${company.taluk}, ${company.district}`
          : company.name,
    }));

    return transformedCompanies;
  } catch (err) {
    console.error("Failed to fetch companies:", err);
    return [];
  }
}

export async function updateBuyerType(
  userId: string,
  buyerType: string | { buyerType?: string | null }
) {
  const payload =
    typeof buyerType === "string"
      ? { buyerType }
      : buyerType ?? { buyerType: null };
  return await callApi(`/users/update-buyer/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function loadStates(): Promise<string[]> {
  try {
    const res = await callApi(`/newlocations/states`, { method: "GET" });
    if (Array.isArray(res)) {
      return res.map((s: any) =>
        typeof s === "string" ? s : s.name || s.state || s.id
      );
    } else if (Array.isArray(res.data)) {
      return res.data.map((s: any) =>
        typeof s === "string" ? s : s.name || s.state || s.id
      );
    }
    return [];
  } catch (err) {
    console.error("Failed to load states:", err);
    return [];
  }
}

export async function loadDistricts(state: string): Promise<string[]> {
  if (!state) return [];
  try {
    const res = await callApi(
      `/newlocations/districts?state=${encodeURIComponent(state)}`,
      { method: "GET" }
    );
    if (Array.isArray(res)) {
      return res.map((d: any) =>
        typeof d === "string" ? d : d.name || d.district || d.id
      );
    } else if (Array.isArray(res.data)) {
      return res.data.map((d: any) =>
        typeof d === "string" ? d : d.name || d.district || d.id
      );
    }
    return [];
  } catch (err) {
    console.error("Failed to load districts:", err);
    return [];
  }
}

export async function loadTaluks(
  state: string,
  district: string
): Promise<string[]> {
  if (!state || !district) return [];
  try {
    const res = await callApi(
      `/newlocations/taluks?state=${encodeURIComponent(
        state
      )}&district=${encodeURIComponent(district)}`,
      { method: "GET" }
    );
    if (Array.isArray(res)) {
      return res.map((t: any) =>
        typeof t === "string" ? t : t.name || t.taluk || t.id
      );
    } else if (Array.isArray(res.data)) {
      return res.data.map((t: any) =>
        typeof t === "string" ? t : t.name || t.taluk || t.id
      );
    }
    return [];
  } catch (err) {
    console.error("Failed to load taluks:", err);
    return [];
  }
}

export async function loadVillages(
  state: string,
  district: string,
  taluk: string
): Promise<string[]> {
  if (!state || !district || !taluk) return [];
  try {
    const res = await callApi(
      `/newlocations/villages?state=${encodeURIComponent(
        state
      )}&district=${encodeURIComponent(district)}&taluk=${encodeURIComponent(
        taluk
      )}`,
      { method: "GET" }
    );
    if (Array.isArray(res)) {
      return res.map((v: any) =>
        typeof v === "string" ? v : v.name || v.village || v.id
      );
    } else if (Array.isArray(res.data)) {
      return res.data.map((v: any) =>
        typeof v === "string" ? v : v.name || v.village || v.id
      );
    }
    return [];
  } catch (err) {
    console.error("Failed to load villages:", err);
    return [];
  }
}

export async function fetchLeads(params: Record<string, any>) {
  const qp = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      v.forEach((x) => qp.append(k, String(x)));
    } else {
      qp.append(k, String(v));
    }
  });

  const path = `/aggregator-leads${
    qp.toString() ? `?${qp.toString()}` : ""
  }`;
  return await callApi(path, { method: "GET" });
}

