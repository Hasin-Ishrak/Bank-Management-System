// Backend responses are generally wrapped like { success, message, data }.
// These helpers defensively unwrap that shape without breaking if the
// backend returns something slightly different.

export function extractData(res) {
    if (res && typeof res === 'object' && 'data' in res) {
        return res.data;
    }
    return res;
}

export function extractList(res, keys = []) {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;

    for (const key of keys) {
        if (res && Array.isArray(res[key])) return res[key];
        if (res && res.data && Array.isArray(res.data[key])) {
            return res.data[key];
        }
    }

    return [];
}

export function formatMoney(value) {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
