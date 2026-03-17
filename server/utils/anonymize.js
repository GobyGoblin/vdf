/**
 * Helper to anonymize candidate data based on the requesting user's role.
 * Employers should only see the first name and limited PII.
 * Staff and Admins should see the full name and full details.
 */
export const anonymizeCandidate = (candidate, role) => {
    if (!candidate) return null;

    // Convert to plain object to avoid mutation of Sequelize instances and ensure consistent structure
    let plain;
    try {
        plain = typeof candidate.toJSON === 'function' ? candidate.toJSON() : JSON.parse(JSON.stringify(candidate));
    } catch (e) {
        plain = { ...candidate };
    }

    const firstName = plain.firstName || 'Candidate';
    const lastName = plain.lastName || '';
    const hashCode = plain.id ? `#${String(plain.id).slice(-4)}` : '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Candidate';
    const anonymizedFullName = `${firstName} ${hashCode}`.trim();

    if (role === 'employer') {
        // Employers see FIRST name + hash code
        plain.fullName = anonymizedFullName;

        // Explicitly clear/obfuscate sensitive fields
        plain.lastName = hashCode;
        plain.firstName = firstName;
        plain.email = '********@germantalent.de';

        // Remove sensitive PII
        delete plain.password;
        delete plain.address;
        delete plain.nationality;
        delete plain.birthDate;
        delete plain.phone;

        // Remove PI from CandidateProfile if present
        if (plain.candidateProfile) {
            delete plain.candidateProfile.phone;
            delete plain.candidateProfile.address;
            delete plain.candidateProfile.city;
            delete plain.candidateProfile.country;
            delete plain.candidateProfile.birthDate;
            delete plain.candidateProfile.email;
        }
    } else {
        // Staff and Admin see the actual FULL name + hash code
        plain.fullName = `${fullName} ${hashCode}`.trim();
    }

    // Set sector if missing (useful for the UI)
    if (!plain.sector) {
        plain.sector = plain.candidateProfile?.sector || plain.candidateProfile?.jobTitle || 'Verified Expert';
    }

    return plain;
};
