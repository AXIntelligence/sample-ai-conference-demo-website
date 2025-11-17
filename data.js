// Data fetching module for Supabase
class EventDataService {
    constructor() {
        this.supabase = null;
        this.eventData = null;
        this.sessions = [];
        this.companies = [];
    }

    // Initialize Supabase client
    async init() {
        try {
            this.supabase = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.key
            );
            console.log('Supabase client initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            return false;
        }
    }

    // Fetch event data
    async fetchEventData() {
        try {
            const { data, error } = await this.supabase
                .from('events')
                .select('*')
                .eq('id', SUPABASE_CONFIG.eventId)
                .single();

            if (error) throw error;

            this.eventData = data;
            console.log('Event data fetched:', data);
            return data;
        } catch (error) {
            console.error('Error fetching event data:', error);
            throw error;
        }
    }

    // Fetch sessions for the event
    async fetchSessions() {
        try {
            const { data, error } = await this.supabase
                .from('sessions')
                .select('*')
                .eq('event_id', SUPABASE_CONFIG.eventId)
                .order('start_time', { ascending: true });

            if (error) throw error;

            this.sessions = data || [];
            console.log(`Fetched ${this.sessions.length} sessions`);
            return this.sessions;
        } catch (error) {
            console.error('Error fetching sessions:', error);
            // Return empty array on error
            this.sessions = [];
            return [];
        }
    }

    // Fetch companies/sponsors - trying multiple possible table structures
    async fetchCompanies() {
        try {
            // First, try to fetch from a companies table if it exists
            const { data: companiesData, error: companiesError } = await this.supabase
                .from('companies')
                .select('*')
                .limit(20);

            if (!companiesError && companiesData && companiesData.length > 0) {
                this.companies = companiesData;
                console.log(`Fetched ${this.companies.length} companies`);
                return this.companies;
            }

            // If companies table doesn't exist or is empty, try event_participants
            const { data: participantsData, error: participantsError } = await this.supabase
                .from('event_participants')
                .select('company')
                .eq('event_id', SUPABASE_CONFIG.eventId)
                .not('company', 'is', null);

            if (!participantsError && participantsData) {
                // Extract unique companies
                const uniqueCompanies = [...new Set(participantsData.map(p => p.company))];
                this.companies = uniqueCompanies.map(name => ({ name }));
                console.log(`Fetched ${this.companies.length} companies from participants`);
                return this.companies;
            }

            // If both fail, try profiles table
            const { data: profilesData, error: profilesError } = await this.supabase
                .from('profiles')
                .select('company')
                .not('company', 'is', null)
                .limit(20);

            if (!profilesError && profilesData) {
                const uniqueCompanies = [...new Set(profilesData.map(p => p.company).filter(c => c))];
                this.companies = uniqueCompanies.slice(0, 15).map(name => ({ name }));
                console.log(`Fetched ${this.companies.length} companies from profiles`);
                return this.companies;
            }

            console.log('No companies found, using empty array');
            this.companies = [];
            return [];
        } catch (error) {
            console.error('Error fetching companies:', error);
            this.companies = [];
            return [];
        }
    }

    // Fetch all data
    async fetchAllData() {
        try {
            await this.init();

            // Fetch event data first
            await this.fetchEventData();

            // Fetch sessions and companies in parallel
            await Promise.all([
                this.fetchSessions(),
                this.fetchCompanies()
            ]);

            return {
                event: this.eventData,
                sessions: this.sessions,
                companies: this.companies
            };
        } catch (error) {
            console.error('Error fetching all data:', error);
            throw error;
        }
    }

    // Get stats from the data
    getStats() {
        const totalSessions = this.sessions.length;

        // Count unique speakers
        const speakers = new Set();
        this.sessions.forEach(session => {
            if (session.speaker) {
                speakers.add(session.speaker);
            }
        });

        // Count unique tracks
        const tracks = new Set();
        this.sessions.forEach(session => {
            if (session.track) {
                tracks.add(session.track);
            }
        });

        return {
            sessions: totalSessions,
            speakers: speakers.size,
            companies: this.companies.length,
            tracks: tracks.size
        };
    }

    // Group sessions by day
    getSessionsByDay() {
        const sessionsByDay = {};

        this.sessions.forEach(session => {
            if (!session.start_time) return;

            const date = new Date(session.start_time);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!sessionsByDay[dateKey]) {
                sessionsByDay[dateKey] = [];
            }

            sessionsByDay[dateKey].push(session);
        });

        return sessionsByDay;
    }

    // Format time from ISO string
    formatTime(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Format date
    formatDate(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }
}

// Create global instance
const eventDataService = new EventDataService();
