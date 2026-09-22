/**
 * Privacy-First Document Converter - API Client
 * Uses native Fetch API without external SaaS dependencies.
 */

const API_BASE = '/api';

export async function fetchConversions() {
  const res = await fetch(`${API_BASE}/conversions`);
  if (!res.ok) {
    throw new Error(`Failed to fetch conversion registry: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Failed to check system health: ${res.statusText}`);
  }
  return res.json();
}

export async function convertFile({
  file,
  targetFormat,
  conversionType = 'convert',
  options = {},
  onProgress = null
}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetFormat);
  formData.append('conversion_type', conversionType);
  formData.append('options', JSON.stringify(options));

  // If onProgress callback is requested, use XMLHttpRequest for upload progress tracking
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/convert`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.detail || 'Conversion failed.'));
          }
        } catch (err) {
          reject(new Error(`Server error: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error. Could not connect to local converter backend.'));
      xhr.send(formData);
    });
  }

  // Otherwise standard fetch
  const res = await fetch(`${API_BASE}/convert`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Conversion request failed.');
  }
  return data;
}

export async function getJob(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`);
  if (!res.ok) {
    throw new Error('Job not found or expired.');
  }
  return res.json();
}

export async function deleteJob(jobId) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function previewSpreadsheet(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/spreadsheet/preview`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Spreadsheet preview failed.');
  }
  return res.json();
}

export async function executeUtility(endpoint, formData) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Operation failed.');
  }
  return res.blob();
}
