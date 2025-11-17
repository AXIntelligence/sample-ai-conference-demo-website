// Rendering module to populate HTML with fetched data
class EventRenderer {
    constructor(dataService) {
        this.dataService = dataService;
    }

    // Show loading spinner
    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-overlay';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(26, 54, 93, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-size: 1.5rem;
        `;
        loadingDiv.innerHTML = '<div>Loading event data...</div>';
        document.body.appendChild(loadingDiv);
    }

    // Hide loading spinner
    hideLoading() {
        const loadingDiv = document.getElementById('loading-overlay');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    // Render hero section
    renderHero(eventData) {
        if (!eventData) return;

        const heroTitle = document.querySelector('.hero h1');
        const heroSubtitle = document.querySelector('.hero .subtitle');
        const heroDateLocation = document.querySelector('.hero .date-location');

        if (heroTitle && eventData.name) {
            heroTitle.textContent = eventData.name;
        }

        if (heroSubtitle && eventData.description) {
            // Use first sentence or first 150 chars as subtitle
            const subtitle = eventData.description.split('.')[0] + '.';
            heroSubtitle.textContent = subtitle.length > 150 ? subtitle.substring(0, 150) + '...' : subtitle;
        }

        if (heroDateLocation && eventData.start_date && eventData.location) {
            const startDate = this.dataService.formatDate(eventData.start_date);
            const endDate = eventData.end_date ? this.dataService.formatDate(eventData.end_date) : '';
            const dateRange = endDate && endDate !== startDate ? `${startDate} - ${endDate}` : startDate;
            heroDateLocation.textContent = `${dateRange} • ${eventData.location}`;
        }
    }

    // Render stats section
    renderStats(stats) {
        const statsContainer = document.querySelector('.stats-container');
        if (!statsContainer) return;

        statsContainer.innerHTML = `
            <div class="stat-item">
                <h3>${stats.sessions || 0}</h3>
                <p>Total Sessions</p>
            </div>
            <div class="stat-item">
                <h3>${stats.speakers || 0}</h3>
                <p>Expert Speakers</p>
            </div>
            <div class="stat-item">
                <h3>${stats.companies || 0}+</h3>
                <p>Companies Represented</p>
            </div>
            <div class="stat-item">
                <h3>${stats.tracks || 0}</h3>
                <p>Tracks</p>
            </div>
        `;
    }

    // Render agenda section
    renderAgenda(sessionsByDay) {
        const agendaContent = document.querySelector('.agenda-content');
        if (!agendaContent) return;

        agendaContent.innerHTML = '';

        const days = Object.keys(sessionsByDay).sort();

        if (days.length === 0) {
            agendaContent.innerHTML = '<p style="text-align: center; color: #666;">No sessions available yet.</p>';
            return;
        }

        days.forEach((day, index) => {
            const sessions = sessionsByDay[day];
            const dayDate = new Date(day);
            const dayName = dayDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });

            const agendaDay = document.createElement('div');
            agendaDay.className = 'agenda-day';

            let dayHtml = `
                <div class="day-header">Day ${index + 1} - ${dayName}</div>
            `;

            sessions.forEach(session => {
                const time = this.dataService.formatTime(session.start_time);
                const title = session.title || 'Untitled Session';
                const description = session.description || '';
                const speaker = session.speaker || '';
                const room = session.room || '';

                dayHtml += `
                    <div class="agenda-item">
                        <div class="agenda-time">${time}</div>
                        <div class="agenda-details">
                            <h4>${title}</h4>
                            <p>${description}${speaker ? '<br><strong>Speaker:</strong> ' + speaker : ''}${room ? '<br><strong>Room:</strong> ' + room : ''}</p>
                        </div>
                    </div>
                `;
            });

            agendaDay.innerHTML = dayHtml;
            agendaContent.appendChild(agendaDay);
        });
    }

    // Render sponsors section
    renderSponsors(companies) {
        if (!companies || companies.length === 0) {
            console.log('No companies to render');
            return;
        }

        const sponsorsSection = document.querySelector('#sponsors');
        if (!sponsorsSection) return;

        const sectionContainer = sponsorsSection.querySelector('.section-container');
        if (!sectionContainer) return;

        // Keep the title and description, replace the rest
        const existingTitle = sectionContainer.querySelector('.section-title');
        const existingDescription = sectionContainer.querySelector('.section-description');

        let newHtml = '';

        if (existingTitle) {
            newHtml += existingTitle.outerHTML;
        }

        if (existingDescription) {
            newHtml += existingDescription.outerHTML;
        }

        // Divide companies into tiers
        const platinumCount = Math.min(3, Math.floor(companies.length / 3));
        const goldCount = Math.min(5, Math.floor(companies.length / 2));

        const platinum = companies.slice(0, platinumCount);
        const gold = companies.slice(platinumCount, platinumCount + goldCount);
        const silver = companies.slice(platinumCount + goldCount);

        // Render platinum sponsors
        if (platinum.length > 0) {
            newHtml += `
                <div class="sponsors-tier">
                    <h3 class="tier-title">Platinum Sponsors</h3>
                    <div class="sponsors-grid">
            `;
            platinum.forEach(company => {
                const companyName = company.name || company.company || 'Company';
                const logo = company.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=200&background=2563eb&color=fff&bold=true`;
                newHtml += `
                    <div class="sponsor-item">
                        <div class="sponsor-logo">
                            <img src="${logo}" alt="${companyName}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=200&background=2563eb&color=fff&bold=true'">
                        </div>
                        <p class="sponsor-name">${companyName}</p>
                    </div>
                `;
            });
            newHtml += `
                    </div>
                </div>
            `;
        }

        // Render gold sponsors
        if (gold.length > 0) {
            newHtml += `
                <div class="sponsors-tier">
                    <h3 class="tier-title">Gold Sponsors</h3>
                    <div class="sponsors-grid">
            `;
            gold.forEach(company => {
                const companyName = company.name || company.company || 'Company';
                const logo = company.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=200&background=fbbf24&color=000&bold=true`;
                newHtml += `
                    <div class="sponsor-item">
                        <div class="sponsor-logo">
                            <img src="${logo}" alt="${companyName}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=200&background=fbbf24&color=000&bold=true'">
                        </div>
                        <p class="sponsor-name">${companyName}</p>
                    </div>
                `;
            });
            newHtml += `
                    </div>
                </div>
            `;
        }

        // Render silver sponsors
        if (silver.length > 0) {
            newHtml += `
                <div class="sponsors-tier">
                    <h3 class="tier-title">Silver Sponsors</h3>
                    <div class="sponsors-grid">
            `;
            silver.forEach(company => {
                const companyName = company.name || company.company || 'Company';
                const logo = company.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=200&background=9ca3af&color=fff&bold=true`;
                newHtml += `
                    <div class="sponsor-item">
                        <div class="sponsor-logo">
                            <img src="${logo}" alt="${companyName}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=200&background=9ca3af&color=fff&bold=true'">
                        </div>
                        <p class="sponsor-name">${companyName}</p>
                    </div>
                `;
            });
            newHtml += `
                    </div>
                </div>
            `;
        }

        sectionContainer.innerHTML = newHtml;
    }

    // Main render function
    async render() {
        try {
            this.showLoading();

            // Fetch all data
            const { event, sessions, companies } = await this.dataService.fetchAllData();

            // Render each section
            this.renderHero(event);

            const stats = this.dataService.getStats();
            this.renderStats(stats);

            const sessionsByDay = this.dataService.getSessionsByDay();
            this.renderAgenda(sessionsByDay);

            this.renderSponsors(companies);

            this.hideLoading();

            console.log('Page rendered successfully!');
        } catch (error) {
            console.error('Error rendering page:', error);
            this.hideLoading();

            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: #ef4444;
                color: white;
                padding: 1rem 2rem;
                border-radius: 5px;
                z-index: 9999;
            `;
            errorDiv.textContent = 'Error loading event data. Please check console for details.';
            document.body.appendChild(errorDiv);

            setTimeout(() => errorDiv.remove(), 5000);
        }
    }
}

// Initialize and render on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing event renderer...');
    const renderer = new EventRenderer(eventDataService);
    await renderer.render();
});
