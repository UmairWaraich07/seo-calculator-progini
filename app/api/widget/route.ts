import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Get the referrer to track which website is using the widget
  const url = new URL(request.url);
  const referrer = request.headers.get("Referer") || "unknown";
  const agencyId = url.searchParams.get("agencyId") || "default";
  const theme = url.searchParams.get("theme") || "default";

  // Generate the widget JavaScript code
  const widgetJs = `
    (function() {
      // Widget configuration
      const config = {
        agencyId: "${agencyId}",
        theme: "${theme}",
        baseUrl: "${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }",
      };
      
      // Create and inject styles
      const styles = document.createElement('style');
      styles.textContent = \`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        #seo-calculator-widget {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 40px auto;
          position: relative;
        }
        
        #seo-calculator-widget * {
          box-sizing: border-box;
        }
        
        #seo-calculator-widget .widget-container {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 25px 50px rgba(99, 102, 241, 0.3);
          overflow: hidden;
          position: relative;
        }
        
        #seo-calculator-widget .widget-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          pointer-events: none;
        }
        
        #seo-calculator-widget .widget-header {
          background: transparent;
          padding: 40px 40px 20px;
          text-align: center;
          position: relative;
          z-index: 2;
        }
        
        #seo-calculator-widget .widget-header h2 {
          margin: 0 0 12px;
          font-size: 2rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        #seo-calculator-widget .widget-header p {
          margin: 0;
          color: rgba(255,255,255,0.9);
          font-size: 1.1rem;
          font-weight: 400;
        }
        
        #seo-calculator-widget .widget-content {
          background: white;
          padding: 40px;
          margin: 0 20px 20px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          position: relative;
          z-index: 2;
        }
        
        #seo-calculator-widget .widget-footer {
          background: transparent;
          padding: 0 40px 30px;
          text-align: center;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.8);
          position: relative;
          z-index: 2;
        }
        
        #seo-calculator-widget .progress-container {
          margin-bottom: 30px;
        }
        
        #seo-calculator-widget .step-indicator {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        #seo-calculator-widget .step-indicator span {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6366f1;
        }
        
        #seo-calculator-widget .progress-bar {
          height: 8px;
          background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 100%);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        
        #seo-calculator-widget .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 20px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        
        #seo-calculator-widget .progress-bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        #seo-calculator-widget .form-group {
          margin-bottom: 24px;
        }
        
        #seo-calculator-widget .location-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        #seo-calculator-widget label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
        }
        
        #seo-calculator-widget input, 
        #seo-calculator-widget select {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 400;
          background: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }
        
        #seo-calculator-widget input:focus, 
        #seo-calculator-widget select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          transform: translateY(-1px);
        }
        
        #seo-calculator-widget input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
        
        #seo-calculator-widget select {
          cursor: pointer;
        }
        
        #seo-calculator-widget select:disabled {
          background-color: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        #seo-calculator-widget .location-note {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 8px;
          line-height: 1.4;
        }
        
        #seo-calculator-widget .location-note .required {
          color: #dc2626;
        }
        
        #seo-calculator-widget button {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          border: none;
          padding: 18px 32px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        #seo-calculator-widget button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        #seo-calculator-widget button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(249, 115, 22, 0.4);
        }
        
        #seo-calculator-widget button:hover::before {
          left: 100%;
        }
        
        #seo-calculator-widget button:active {
          transform: translateY(0);
        }
        
        #seo-calculator-widget button:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        #seo-calculator-widget .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }
        
        #seo-calculator-widget .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 24px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        #seo-calculator-widget .loading p {
          color: #6b7280;
          font-size: 1.1rem;
          font-weight: 500;
          margin: 0;
        }
        
        #seo-calculator-widget .success-message {
          text-align: center;
          padding: 40px 20px;
        }
        
        #seo-calculator-widget .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          font-size: 2.5rem;
          font-weight: bold;
        }
        
        #seo-calculator-widget .success-message h3 {
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 12px;
        }
        
        #seo-calculator-widget .success-message p {
          color: #6b7280;
          font-size: 1rem;
          margin: 0 0 24px;
        }
        
        #seo-calculator-widget .radio-group {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        #seo-calculator-widget .radio-option {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex: 1;
          min-width: 200px;
        }
        
        #seo-calculator-widget .radio-option:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.05);
        }
        
        #seo-calculator-widget .radio-option input {
          width: 20px;
          height: 20px;
          margin-right: 12px;
          accent-color: #6366f1;
        }
        
        #seo-calculator-widget .radio-option label {
          margin: 0;
          cursor: pointer;
          font-weight: 500;
        }
        
        #seo-calculator-widget .switch-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }
        
        #seo-calculator-widget .switch-label {
          display: flex;
          flex-direction: column;
        }
        
        #seo-calculator-widget .switch-label-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }
        
        #seo-calculator-widget .switch-label-description {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        #seo-calculator-widget .switch-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        #seo-calculator-widget .switch-text {
          font-size: 0.875rem;
          font-weight: 600;
          transition: color 0.3s;
        }
        
        #seo-calculator-widget .switch {
          position: relative;
          display: inline-block;
          width: 52px;
          height: 28px;
        }
        
        #seo-calculator-widget .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        #seo-calculator-widget .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #cbd5e1;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 28px;
        }
        
        #seo-calculator-widget .slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 3px;
          bottom: 3px;
          background: white;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        #seo-calculator-widget input:checked + .slider {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        }
        
        #seo-calculator-widget input:checked + .slider:before {
          transform: translateX(24px);
        }
        
        #seo-calculator-widget .badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
          border-radius: 20px;
          margin-left: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        #seo-calculator-widget .badge-outline {
          border: 1px solid #d1d5db;
          color: #6b7280;
          background: white;
        }
        
        #seo-calculator-widget .badge-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
        }
        
        #seo-calculator-widget .badge-secondary {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
        }
        
        #seo-calculator-widget .icon {
          display: inline-block;
          width: 1em;
          height: 1em;
          margin-right: 6px;
        }
        
        #seo-calculator-widget .tooltip {
          position: relative;
          display: inline-block;
          cursor: help;
        }
        
        #seo-calculator-widget .tooltip-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
        }
        
        #seo-calculator-widget .tooltip-text {
          visibility: hidden;
          width: 280px;
          background: #1f2937;
          color: white;
          text-align: left;
          border-radius: 8px;
          padding: 12px 16px;
          position: absolute;
          z-index: 1000;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 0.875rem;
          font-weight: 400;
          line-height: 1.4;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        #seo-calculator-widget .tooltip-text::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #1f2937 transparent transparent transparent;
        }
        
        #seo-calculator-widget .tooltip:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
        
        #seo-calculator-widget .competitor-item {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        #seo-calculator-widget .competitor-item:hover {
          border-color: #6366f1;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.15);
        }
        
        #seo-calculator-widget .competitor-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        #seo-calculator-widget .competitor-name {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          font-size: 1.1rem;
        }
        
        #seo-calculator-widget .competitor-url {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 4px 0 0;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          #seo-calculator-widget {
            margin: 20px auto;
            max-width: 95%;
          }
          
          #seo-calculator-widget .widget-header {
            padding: 30px 20px 15px;
          }
          
          #seo-calculator-widget .widget-header h2 {
            font-size: 1.5rem;
          }
          
          #seo-calculator-widget .widget-content {
            padding: 30px 20px;
            margin: 0 10px 10px;
          }
          
          #seo-calculator-widget .location-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          #seo-calculator-widget .radio-group {
            flex-direction: column;
          }
          
          #seo-calculator-widget .radio-option {
            min-width: auto;
          }
          
          #seo-calculator-widget .switch-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      \`;
      document.head.appendChild(styles);
      
      // Function to initialize the widget
      function initWidget() {
        // Find the container element
        const container = document.getElementById('seo-calculator-widget');
        if (!container) {
          console.error('SEO Calculator Widget: No container with ID "seo-calculator-widget" found');
          // Try again in a moment - the DOM might not be fully loaded
          setTimeout(initWidget, 300);
          return;
        }
        
        // Initialize widget state
        let currentStep = 1;
        let formData = {
          businessUrl: '',
          businessType: '',
          location: '',
          locationCode: null,
          customerValue: '',
          competitorType: 'auto',
          analysisScope: 'local',
          competitors: ['', '', '', '', ''],
          email: ''
        };
        let processingProgress = 0;
        let reportId = '';
        let states = [];
        let cities = [];
        let selectedState = null;
        let selectedCity = null;
        let loadingStates = true;
        let loadingCities = false;
        
        // Fetch states when widget initializes
        fetchStates();
        
        // Render the initial widget
        renderWidget();
        
        // Fetch states function
        async function fetchStates() {
          loadingStates = true;
          console.log('Fetching states...');
          try {
            const response = await fetch(\`\${config.baseUrl}/api/locations\`);
            console.log('States response status:', response.status);
            if (response.ok) {
              const data = await response.json();
              states = Array.isArray(data) ? data : [];
              console.log('Loaded states:', states.length);
            } else {
              console.error('Failed to fetch states:', response.status, response.statusText);
            }
          } catch (error) {
            console.error('Error fetching states:', error);
          } finally {
            loadingStates = false;
            renderWidget(); // Re-render to enable the dropdown
          }
        }
        
        // Fetch cities for a state
        async function fetchCities(stateName) {
          loadingCities = true;
          console.log('Fetching cities for:', stateName);
          try {
            const response = await fetch(\`\${config.baseUrl}/api/locations?state=\${encodeURIComponent(stateName)}\`);
            console.log('Cities response status:', response.status);
            if (response.ok) {
              const data = await response.json();
              cities = Array.isArray(data) ? data : [];
              console.log('Loaded cities:', cities.length);
            } else {
              console.error('Failed to fetch cities:', response.status, response.statusText);
              cities = [];
            }
          } catch (error) {
            console.error('Error fetching cities:', error);
            cities = [];
          } finally {
            loadingCities = false;
            renderWidget(); // Re-render to update city dropdown
          }
        }
        
        // Main render function
        function renderWidget() {
          // Create widget structure
          container.innerHTML = \`
            <div class="widget-container">
              <div class="widget-header">
                <h2>SEO Opportunity Calculator</h2>
                <p>Discover Your Untapped SEO Revenue Potential</p>
              </div>
              <div class="widget-content">
                <div class="progress-container">
                  <div class="step-indicator">
                    <span>Step \${currentStep} of 4</span>
                    <span>\${getStepName(currentStep)}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: \${getProgressWidth()}%"></div>
                  </div>
                </div>
                \${renderStepContent()}
              </div>
              <div class="widget-footer">
                Powered by SEO Opportunity Calculator
              </div>
            </div>
          \`;
          
          // Add event listeners after rendering
          addEventListeners();
        }
        
        // Get the current step name
        function getStepName(step) {
          switch(step) {
            case 1: return 'Business Information';
            case 2: return 'Competitors';
            case 3: return 'Processing';
            case 4: return 'Get Your Report';
            default: return '';
          }
        }
        
        // Get progress bar width based on current step
        function getProgressWidth() {
          switch(currentStep) {
            case 1: return 25;
            case 2: return 50;
            case 3: return 50 + processingProgress / 2;
            case 4: return 100;
            default: return 0;
          }
        }
        
        // Render content based on current step
        function renderStepContent() {
          switch(currentStep) {
            case 1: return renderBusinessInfoForm();
            case 2: return renderCompetitorForm();
            case 3: return renderProcessingScreen();
            case 4: return renderEmailForm();
            default: return '';
          }
        }
        
        // Step 1: Business Information Form
        function renderBusinessInfoForm() {
          const stateOptions = states.map(state => 
            \`<option value="\${state.name}" data-code="\${state.code}" \${selectedState?.name === state.name ? 'selected' : ''}>\${state.name}</option>\`
          ).join('');
          
          const cityOptions = cities.map(city => 
            \`<option value="\${city.name}" data-code="\${city.code}" \${selectedCity?.name === city.name ? 'selected' : ''}>\${city.name}</option>\`
          ).join('');
          
          return \`
            <form id="business-info-form">
              <div class="form-group">
                <label for="businessUrl">Your Website URL</label>
                <input 
                  type="url" 
                  id="businessUrl" 
                  placeholder="https://yourwebsite.com" 
                  value="\${formData.businessUrl}" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="businessType">Business Type</label>
                <input 
                  type="text" 
                  id="businessType" 
                  placeholder="e.g., Digital Marketing, Web Design, SEO" 
                  value="\${formData.businessType}" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label>Primary Location</label>
                <div class="location-grid">
                  <div>
                    <label for="stateSelect">State \${formData.analysisScope === 'local' ? '<span class="required">*</span>' : ''}</label>
                    <select 
                      id="stateSelect" 
                      \${formData.analysisScope === 'local' ? 'required' : ''}
                      \${loadingStates ? 'disabled' : ''}
                    >
                      <option value="">\${loadingStates ? 'Loading states...' : 'Select state...'}</option>
                      \${stateOptions}
                    </select>
                  </div>
                  <div>
                    <label for="citySelect">City (Optional)</label>
                    <select 
                      id="citySelect"
                      \${!selectedState || loadingCities ? 'disabled' : ''}
                    >
                      <option value="">\${loadingCities ? 'Loading cities...' : 'Select city...'}</option>
                      \${cityOptions}
                    </select>
                  </div>
                </div>
                <div class="location-note">
                  \${formData.analysisScope === 'local' 
                    ? '<span class="required">*</span> Location is required for local analysis.' 
                    : 'Location is set to United States for national analysis. State and city selection is optional.'}
                </div>
              </div>
              
              <div class="form-group">
                <label for="customerValue">Average Customer Value ($)</label>
                <input 
                  type="number" 
                  id="customerValue" 
                  placeholder="e.g., 2500" 
                  value="\${formData.customerValue}" 
                  required
                />
              </div>
              
              <div class="switch-container">
                <div class="switch-label">
                  <span class="switch-label-title">Analysis Scope</span>
                  <span class="switch-label-description">Choose between local or national competitor analysis</span>
                </div>
                <div class="switch-toggle">
                  <span class="switch-text" style="color: \${formData.analysisScope === 'local' ? '#6366f1' : '#6b7280'}">Local</span>
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      id="analysisScope" 
                      \${formData.analysisScope === 'national' ? 'checked' : ''}
                    />
                    <span class="slider"></span>
                  </label>
                  <span class="switch-text" style="color: \${formData.analysisScope === 'national' ? '#6366f1' : '#6b7280'}">National</span>
                  <span class="tooltip">
                    <span class="tooltip-icon">?</span>
                    <span class="tooltip-text">
                      <strong>Local:</strong> Analyzes competitors in your specific location using Google Maps data.<br><br>
                      <strong>National:</strong> Analyzes top organic competitors nationwide using advanced SEO data.
                    </span>
                  </span>
                </div>
              </div>
              
              <div class="form-group">
                <label>Competitor Selection</label>
                <div class="radio-group">
                  <div class="radio-option">
                    <input 
                      type="radio" 
                      id="competitorTypeAuto" 
                      name="competitorType" 
                      value="auto" 
                      \${formData.competitorType === 'auto' ? 'checked' : ''}
                    />
                    <label for="competitorTypeAuto">
                      Auto-detect competitors 
                      \${formData.analysisScope === 'local' ? 'from Google Maps' : 'from SEO data'}
                    </label>
                  </div>
                  <div class="radio-option">
                    <input 
                      type="radio" 
                      id="competitorTypeManual" 
                      name="competitorType" 
                      value="manual" 
                      \${formData.competitorType === 'manual' ? 'checked' : ''}
                    />
                    <label for="competitorTypeManual">Manually enter competitors</label>
                  </div>
                </div>
              </div>
              
              <button type="submit">Get My SEO Analysis</button>
            </form>
          \`;
        }
        
        // Step 2: Competitor Form
        function renderCompetitorForm() {
          let competitorFields = '';
          
          if (formData.competitorType === 'auto' && !formData.competitors[0]) {
            competitorFields = \`
              <div class="loading">
                <div class="spinner"></div>
                <p>
                  \${formData.analysisScope === 'local' 
                    ? \`Detecting local competitors in \${formData.location}...\` 
                    : 'Detecting national competitors in your industry...'}
                </p>
              </div>
            \`;
            
            // Simulate competitor detection
            setTimeout(() => {
              if (formData.analysisScope === 'local') {
                // Simulate local competitors from Google Maps
                formData.competitors = [
                  \`https://www.\${formData.location.toLowerCase().replace(/\\s+/g, '')}\${formData.businessType.toLowerCase().replace(/\\s+/g, '')}pros.com\`,
                  \`https://www.\${formData.businessType.toLowerCase().replace(/\\s+/g, '')}expertsof\${formData.location.toLowerCase().replace(/\\s+/g, '')}.com\`,
                  \`https://www.\${formData.location.toLowerCase().replace(/\\s+/g, '')}\${formData.businessType.toLowerCase().replace(/\\s+/g, '')}services.com\`,
                  \`https://www.best\${formData.businessType.toLowerCase().replace(/\\s+/g, '')}in\${formData.location.toLowerCase().replace(/\\s+/g, '')}.com\`,
                  \`https://www.\${formData.location.toLowerCase().replace(/\\s+/g, '')}premier\${formData.businessType.toLowerCase().replace(/\\s+/g, '')}.com\`
                ];
              } else {
                // Simulate national competitors
                formData.competitors = [
                  \`https://www.national\${formData.businessType.toLowerCase().replace(/\\s+/g, '')}.com\`,
                  \`https://www.\${formData.businessType.toLowerCase().replace(/\\s+/g, '')}america.com\`,
                  \`https://www.usa\${formData.businessType.toLowerCase().replace(/\\s+/g, '')}solutions.com\`,
                  \`https://www.\${formData.businessType.toLowerCase().replace(/\\s+/g, '')}nationwide.com\`,
                  \`https://www.premium\${formData.businessType.toLowerCase().replace(/\\s+/g, '')}services.com\`
                ];
              }
              renderWidget();
            }, 2000);
          } else {
            // Show detected competitors or input fields
            if (formData.competitorType === 'auto' && formData.competitors[0]) {
              competitorFields += \`
                <div style="margin-bottom: 24px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="margin: 0; font-size: 1.1rem; font-weight: 600; color: #374151;">Detected Competitors</h4>
                    <span class="badge \${formData.analysisScope === 'local' ? 'badge-primary' : 'badge-secondary'}">
                      \${formData.analysisScope === 'local' 
                        ? '<span class="icon">📍</span> Local' 
                        : '<span class="icon">🌐</span> National'}
                    </span>
                  </div>
              \`;
              
              for (let i = 0; i < formData.competitors.length; i++) {
                if (formData.competitors[i]) {
                  const competitorName = formData.competitors[i].replace(/^https?:\\/\\/(?:www\\.)?/, '').split('.')[0];
                  competitorFields += \`
                    <div class="competitor-item">
                      <div class="competitor-header">
                        <div>
                          <p class="competitor-name">\${competitorName}</p>
                          <p class="competitor-url">\${formData.competitors[i]}</p>
                        </div>
                        <span class="badge badge-outline">
                          \${formData.analysisScope === 'local' ? 'Google Maps' : 'SEO Data'}
                        </span>
                      </div>
                    </div>
                  \`;
                }
              }
              
              competitorFields += '</div>';
            }
            
            for (let i = 0; i < 5; i++) {
              competitorFields += \`
                <div class="form-group">
                  <label for="competitor\${i}">Competitor \${i + 1} URL</label>
                  <input 
                    type="url" 
                    id="competitor\${i}" 
                    placeholder="https://competitor.com" 
                    value="\${formData.competitors[i] || ''}"
                  />
                </div>
              \`;
            }
          }
          
          return \`
            <form id="competitor-form">
              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <h3 style="margin: 0; color: #1f2937;">\${formData.competitorType === 'auto' ? 'Detected Competitors' : 'Enter Your Competitors'}</h3>
                  <span class="badge \${formData.analysisScope === 'local' ? 'badge-primary' : 'badge-secondary'}">
                    \${formData.analysisScope === 'local' 
                      ? '<span class="icon">📍</span> Local' 
                      : '<span class="icon">🌐</span> National'}
                  </span>
                </div>
                <p style="margin-top: 4px; font-size: 0.875rem; color: #6b7280;">
                  \${formData.analysisScope === 'local' 
                    ? \`Based on your local market in \${formData.location}\`
                    : 'Based on national organic search rankings'}
                </p>
              </div>
              
              \${competitorFields}
              
              \${formData.competitorType === 'auto' && !formData.competitors[0] ? '' : \`
                <button type="submit">Analyze Competition</button>
              \`}
            </form>
          \`;
        }
        
        // Step 3: Processing Screen
        function renderProcessingScreen() {
          // Simulate progress updates
          if (processingProgress < 100) {
            setTimeout(() => {
              processingProgress += 5;
              renderWidget();
              
              if (processingProgress >= 100) {
                // Move to next step when processing is complete
                currentStep = 4;
                reportId = 'SAMPLE-REPORT-' + Date.now();
                renderWidget();
              }
            }, 300);
          }
          
          return \`
            <div class="loading">
              <div style="margin-bottom: 24px;">
                <span class="badge \${formData.analysisScope === 'local' ? 'badge-primary' : 'badge-secondary'}">
                  \${formData.analysisScope === 'local' 
                    ? '<span class="icon">📍</span> Local Analysis' 
                    : '<span class="icon">🌐</span> National Analysis'}
                </span>
              </div>
              <div class="spinner"></div>
              <p>\${getProcessingStatusMessage()}</p>
              <div class="progress-bar" style="width: 100%; margin-top: 24px;">
                <div class="progress-bar-fill" style="width: \${processingProgress}%"></div>
              </div>
              <p style="font-size: 0.95rem; color: #6b7280; margin-top: 20px; line-height: 1.5;">
                \${formData.analysisScope === 'local'
                  ? \`We're analyzing your website and local competitors to identify SEO opportunities in your area.\`
                  : \`We're analyzing your website and national competitors to identify SEO opportunities across the country.\`}
              </p>
            </div>
          \`;
        }
        
        // Get processing status message based on progress
        function getProcessingStatusMessage() {
          if (processingProgress < 25) {
            return "Analyzing your website...";
          } else if (processingProgress < 50) {
            return formData.analysisScope === 'local'
              ? "Gathering local competitor data..."
              : "Gathering national competitor data...";
          } else if (processingProgress < 75) {
            return "Collecting keyword rankings...";
          } else {
            return "Calculating revenue opportunities...";
          }
        }
        
        // Step 4: Email Form
        function renderEmailForm() {
          return \`
            <div class="success-message">
              <div class="success-icon">✓</div>
              <h3>Your SEO Report is Ready!</h3>
              <p>Enter your email below to receive your detailed SEO opportunity report with revenue projections.</p>
              <div style="margin: 20px 0;">
                <span class="badge \${formData.analysisScope === 'local' ? 'badge-primary' : 'badge-secondary'}">
                  \${formData.analysisScope === 'local' 
                    ? '<span class="icon">📍</span> Local Analysis' 
                    : '<span class="icon">🌐</span> National Analysis'}
                </span>
              </div>
            </div>
            
            <form id="email-form">
              <div class="form-group">
                <label for="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="your@email.com" 
                  value="\${formData.email}" 
                  required
                />
              </div>
              
              <button type="submit">Get My SEO Report</button>
              
              <p style="text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 20px; line-height: 1.4;">
                By submitting this form, you agree to receive your SEO report and occasional marketing emails. We respect your privacy.
              </p>
            </form>
          \`;
        }
        
        // Add event listeners to the current form
        function addEventListeners() {
          if (currentStep === 1) {
            const form = document.getElementById('business-info-form');
            if (form) {
              form.addEventListener('submit', handleBusinessInfoSubmit);
              
              // Add state selection event listener
              const stateSelect = document.getElementById('stateSelect');
              if (stateSelect) {
                stateSelect.addEventListener('change', async (e) => {
                  console.log('State changed:', e.target.value);
                  const selectedOption = e.target.selectedOptions[0];
                  if (selectedOption && selectedOption.value) {
                    selectedState = {
                      name: selectedOption.value,
                      code: parseInt(selectedOption.dataset.code)
                    };
                    selectedCity = null;
                    cities = []; // Clear cities when state changes
                    
                    // Update location and location code
                    formData.location = selectedState.name;
                    formData.locationCode = selectedState.code;
                    
                    console.log('Selected state:', selectedState);
                    
                    // Fetch cities for this state
                    await fetchCities(selectedState.name);
                  } else {
                    selectedState = null;
                    selectedCity = null;
                    cities = [];
                    formData.location = '';
                    formData.locationCode = null;
                    renderWidget();
                  }
                });
              }
              
              // Add city selection event listener
              const citySelect = document.getElementById('citySelect');
              if (citySelect) {
                citySelect.addEventListener('change', (e) => {
                  console.log('City changed:', e.target.value);
                  const selectedOption = e.target.selectedOptions[0];
                  if (selectedOption && selectedOption.value) {
                    selectedCity = {
                      name: selectedOption.value,
                      code: parseInt(selectedOption.dataset.code)
                    };
                    
                    // Update location to just city name and use city's location code
                    formData.location = selectedCity.name;
                    formData.locationCode = selectedCity.code;
                    
                    console.log('Selected city:', selectedCity);
                  } else {
                    selectedCity = null;
                    // Revert to state location
                    if (selectedState) {
                      formData.location = selectedState.name;
                      formData.locationCode = selectedState.code;
                    }
                  }
                });
              }
              
              // Add analysis scope toggle event listener
              const analysisScope = document.getElementById('analysisScope');
              if (analysisScope) {
                analysisScope.addEventListener('change', (e) => {
                  formData.analysisScope = e.target.checked ? 'national' : 'local';
                  
                  // Set location code for national analysis
                  if (formData.analysisScope === 'national') {
                    formData.locationCode = 2840; // US location code
                  } else {
                    // Reset to selected location code for local analysis
                    if (selectedCity) {
                      formData.locationCode = selectedCity.code;
                    } else if (selectedState) {
                      formData.locationCode = selectedState.code;
                    } else {
                      formData.locationCode = null;
                    }
                  }
                  
                  // Re-render to update UI
                  renderWidget();
                });
              }
              
              // Add radio button event listeners
              const radioAuto = document.getElementById('competitorTypeAuto');
              const radioManual = document.getElementById('competitorTypeManual');
              if (radioAuto && radioManual) {
                radioAuto.addEventListener('change', () => {
                  formData.competitorType = 'auto';
                });
                radioManual.addEventListener('change', () => {
                  formData.competitorType = 'manual';
                });
              }
            }
          } else if (currentStep === 2) {
            const form = document.getElementById('competitor-form');
            if (form) {
              form.addEventListener('submit', handleCompetitorSubmit);
            }
          } else if (currentStep === 4) {
            const form = document.getElementById('email-form');
            if (form) {
              form.addEventListener('submit', handleEmailSubmit);
            }
          }
        }
        
        // Handle business info form submission
        function handleBusinessInfoSubmit(e) {
          e.preventDefault();
          
          // Update form data
          formData.businessUrl = document.getElementById('businessUrl').value;
          formData.businessType = document.getElementById('businessType').value;
          formData.customerValue = document.getElementById('customerValue').value;
          
          // Validate location for local analysis
          if (formData.analysisScope === 'local' && !formData.location) {
            alert('Please select a state for local analysis.');
            return;
          }
          
          // Reset competitors array if switching analysis scope
          formData.competitors = ['', '', '', '', ''];
          
          // Move to next step
          currentStep = 2;
          renderWidget();
        }
        
        // Handle competitor form submission
        function handleCompetitorSubmit(e) {
          e.preventDefault();
          
          // Update form data if manual entry
          if (formData.competitorType === 'manual') {
            for (let i = 0; i < 5; i++) {
              const input = document.getElementById('competitor' + i);
              if (input) {
                formData.competitors[i] = input.value;
              }
            }
          }
          
          // Move to processing step
          currentStep = 3;
          processingProgress = 0;
          renderWidget();
          
          // In a real implementation, we would send the data to the server here
          // For now, we'll just simulate the processing
        }
        
        // Handle email form submission
        function handleEmailSubmit(e) {
          e.preventDefault();
          
          // Update form data
          formData.email = document.getElementById('email').value;
          
          // Send data to server
          fetch(\`\${config.baseUrl}/api/widget-submit\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agencyId: config.agencyId,
              formData: formData,
              reportId: reportId,
              referrer: window.location.href
            })
          })
          .then(response => response.json())
          .then(data => {
            // Show thank you message
            container.innerHTML = \`
              <div class="widget-container">
                <div class="widget-header">
                  <h2>Thank You!</h2>
                  <p>Your SEO report has been sent to your inbox</p>
                </div>
                <div class="widget-content">
                  <div class="success-message">
                    <div class="success-icon">✓</div>
                    <h3>Your SEO Report Has Been Sent!</h3>
                    <p>Please check your email inbox for your detailed SEO opportunity report with revenue projections.</p>
                    <div style="margin: 20px 0;">
                      <span class="badge \${formData.analysisScope === 'local' ? 'badge-primary' : 'badge-secondary'}">
                        \${formData.analysisScope === 'local' 
                          ? '<span class="icon">📍</span> Local Analysis' 
                          : '<span class="icon">🌐</span> National Analysis'}
                      </span>
                    </div>
                    <p style="margin-top: 24px; font-weight: 600; color: #374151;">Want to discuss your SEO opportunities with an expert?</p>
                    <button onclick="window.open('\${config.baseUrl}/schedule-call?ref=widget&agency=\${config.agencyId}&scope=\${formData.analysisScope}', '_blank')" style="margin-top: 16px;">
                      Schedule a Free Consultation
                    </button>
                  </div>
                </div>
                <div class="widget-footer">
                  Powered by SEO Opportunity Calculator
                </div>
              </div>
            \`;
          })
          .catch(error => {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your request. Please try again.');
          });
        }
      }
      
      // Start the widget initialization
      // Use DOMContentLoaded or immediate execution depending on when the script is loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
      } else {
        initWidget();
      }
    })();
  `;

  // Return the JavaScript with proper content type
  return new NextResponse(widgetJs, {
    headers: {
      "Content-Type": "application/javascript",
    },
  });
}
