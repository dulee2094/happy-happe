// js/case_detail_api.js
// Centralized API handler for Case Detail functions

window.CaseAPI = {
    /**
     * Fetch Apology Status for the current case
     */
    async fetchApologyStatus(caseId) {
        if (!caseId) return null;
        try {
            const res = await fetch(`/api/case/apology?caseId=${caseId}`);
            return await res.json();
        } catch (err) {
            console.error('Fetch Apology Error:', err);
            return null;
        }
    },

    /**
     * Submit Consultation Form
     */
    async submitConsultation(data) {
        try {
            const res = await fetch('/api/consultation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error('Consultation Error:', err);
            throw err; // Let caller handle
        }
    }
};
