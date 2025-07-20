import { formatCurrency } from "@/lib/email";

interface ReportEmailTemplateProps {
  report: any;
  basicInfo: any;
  previewText: string;
}

export function ReportEmailTemplate({
  report,
  basicInfo,
  previewText,
}: ReportEmailTemplateProps): string {
  const {
    totalSearchVolume,
    potentialTraffic,
    conversionRate,
    potentialCustomers,
    potentialRevenue,
    currentRankings,
    competitorRankings,
    keywordData,
    analysisScope,
  } = report;

  // Format large numbers
  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toLocaleString();
  };

  // Generate keyword table rows with beautiful styling
  const keywordRows = keywordData
    .sort((a: any, b: any) => b.searchVolume - a.searchVolume)
    .slice(0, 20) // Show top 20 keywords
    .map(
      (kw: any, index: number) => `
   <tr style="border-bottom: 1px solid #e5e7eb; transition: all 0.2s ease;">
     <td style="padding: 18px 24px; font-weight: 600; color: #1f2937; font-size: 15px; border-left: 4px solid ${
       index < 5 ? "#10b981" : index < 10 ? "#3b82f6" : "#6b7280"
     };">
       <div style="display: flex; align-items: center; gap: 8px;">
         <span>${kw.keyword}</span>
       </div>
     </td>
     <td style="padding: 18px 24px; text-align: center; font-weight: 700; color: #059669; font-size: 16px;">
       ${formatNumber(kw.searchVolume)}
     </td>
     <td style="padding: 18px 24px; text-align: center; font-weight: 700; font-size: 15px; ${
       kw.clientRank === "Not ranked"
         ? "color: #6b7280;"
         : kw.clientRank <= 3
         ? "color: #059669; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 8px;"
         : kw.clientRank <= 10
         ? "color: #2563eb; background: linear-gradient(135deg, #dbeafe, #93c5fd); border-radius: 8px;"
         : kw.clientRank <= 50
         ? "color: #d97706; background: linear-gradient(135deg, #fef3c7, #fcd34d); border-radius: 8px;"
         : "color: #dc2626; background: linear-gradient(135deg, #fee2e2, #fca5a5); border-radius: 8px;"
     }">
       ${kw.clientRank === "Not ranked" ? "Unranked" : `#${kw.clientRank}`}
     </td>
   </tr>
 `
    )
    .join("");

  // Generate competitor comparison
  const competitorComparison = competitorRankings
    .slice(0, 5)
    .map(
      (competitor: any, index: number) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 16px 20px; font-weight: 600; color: #374151; font-size: 14px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 8px; height: 8px; background: ${
            index === 0 ? "#ef4444" : index === 1 ? "#f59e0b" : "#6b7280"
          }; border-radius: 50%;"></div>
          ${competitor.name}
        </div>
      </td>
      <td style="padding: 16px 20px; text-align: center; font-weight: 700; color: #059669; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 6px;">${
        competitor.top3
      }</td>
      <td style="padding: 16px 20px; text-align: center; font-weight: 700; color: #2563eb; background: linear-gradient(135deg, #dbeafe, #93c5fd); border-radius: 6px;">${
        competitor.top10
      }</td>
      <td style="padding: 16px 20px; text-align: center; font-weight: 700; color: #d97706; background: linear-gradient(135deg, #fef3c7, #fcd34d); border-radius: 6px;">${
        competitor.top50
      }</td>
      <td style="padding: 16px 20px; text-align: center; font-weight: 600; color: #6b7280;">${
        competitor.top100
      }</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your SEO Opportunity Report - ${basicInfo.businessUrl}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; 
      color: #1f2937; 
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      min-height: 100vh;
    }
    
    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
    
    .container {
      max-width: 700px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 48px;
      padding: 48px 40px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 2px solid #e5e7eb;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5);
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 25%, #06b6d4 50%, #10b981 75%, #f59e0b 100%);
    }
    
    .logo-section {
      margin-bottom: 24px;
    }
    
    .logo-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
    }
    
    .main-title {
      font-size: 36px;
      font-weight: 900;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #1f2937, #374151);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }
    
    .subtitle {
      color: #6b7280;
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 20px;
    }
    
    .badge {
      display: inline-block;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 50px;
      color: white;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .badge-local {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }
    
    .badge-national {
      background: linear-gradient(135deg, #059669, #047857);
    }
    
    .section {
      margin-bottom: 40px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 2px solid #e5e7eb;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      position: relative;
    }
    
    .section-title {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 24px;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .section-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 12px;
      display: flex;
      align-items: center !important;
      justify-content: center !important;
      font-size: 20px;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      padding: 36px; 
      border-radius: 20px; 
      margin-bottom: 32px; 
      box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25);
      position: relative;
      overflow: hidden;
    }
    
    .highlight-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="90" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }
    
    .highlight-text {
      color: white;
      font-size: 20px;
      line-height: 1.7;
      font-weight: 500;
      position: relative;
      z-index: 1;
    }
    
    .highlight-number {
      font-weight: 800;
      font-size: 24px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 24px;
      margin: 32px 0;
    }
    
    .stat-card {
      text-align: center;
      padding: 32px 24px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 2px solid #e5e7eb;
      border-radius: 16px; 
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    .stat-card:hover::before {
      transform: scaleX(1);
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .stat-value {
      font-size: 36px;
      font-weight: 900;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px; 
      display: block;
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 14px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .table-container {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
      margin: 24px 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }
    
    th {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      text-align: left; 
      padding: 20px 24px; 
      border: none;
      font-weight: 800;
      color: #374151;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    td {
      padding: 18px 24px;
      border: none;
      background: white;
      font-size: 15px;
    }
    
    .cta-section {
      text-align: center;
      margin: 48px 0;
      padding: 48px 40px;
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      position: relative;
      overflow: hidden;
    }
    
    .cta-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      pointer-events: none;
    }
    
    .cta-title {
      font-size: 32px;
      font-weight: 900;
      margin-bottom: 16px;
      color: white;
      position: relative;
      z-index: 1;
    }
    
    .cta-subtitle {
      font-size: 18px;
      margin-bottom: 32px;
      color: #d1d5db;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white !important; 
      padding: 18px 36px; 
      text-decoration: none; 
      border-radius: 50px; 
      font-weight: 700; 
      font-size: 16px;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
      transition: all 0.3s ease;
      border: none;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      z-index: 1;
      overflow: hidden;
    }
    
    .button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }
    
    .button:hover::before {
      left: 100%;
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(59, 130, 246, 0.4);
    }
    
    .footer {
      text-align: center;
      margin-top: 48px; 
      padding: 40px;
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border: 2px solid #e5e7eb;
      border-radius: 20px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
      font-size: 14px; 
      color: #6b7280; 
    }
    
    .footer-title {
      font-weight: 700;
      color: #374151;
      margin-bottom: 16px;
      font-size: 16px;
    }
    
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .metric-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    .metric-label {
      color: #6b7280;
      font-weight: 600;
      font-size: 16px;
    }
    
    .metric-value {
      font-weight: 800;
      color: #1f2937;
      font-size: 18px;
    }
    
    .metric-highlight {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 900;
      font-size: 24px;
    }
    
    @media only screen and (max-width: 600px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .container {
        padding: 20px 16px;
      }
      .section {
        padding: 24px 20px;
      }
      .header {
        padding: 32px 24px;
      }
      .main-title {
        font-size: 28px;
      }
      .cta-section {
        padding: 32px 24px;
      }
      .cta-title {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="preheader">${previewText}</div>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        <img src="https://progini-seo-calculator.vercel.app/logo.png" alt="Progini AI Logo" style="width: 100px; ">
      </div>
      <h1 class="main-title">Your SEO Opportunity Report</h1>
      <p class="subtitle">Comprehensive growth analysis for ${
        basicInfo.businessUrl
      }</p>
      <span class="badge badge-${
        basicInfo.analysisScope === "local" ? "local" : "national"
      }">
        ${
          basicInfo.analysisScope === "local"
            ? "🗺️ Local Market Analysis"
            : "🌐 National Market Analysis"
        }
      </span>
    </div>
    
    <!-- Executive Summary -->
    <div class="section">
      <h2 class="section-title">
        <div class="section-icon">💡</div>
        Executive Summary
      </h2>
      <div class="highlight-box">
        <p class="highlight-text">
          We discovered <span class="highlight-number">${formatNumber(
            totalSearchVolume
          )}</span> monthly searches 
          ${
            basicInfo.analysisScope === "local"
              ? `in ${basicInfo.location}`
              : "nationwide"
          } for keywords relevant to your business.
        </p>
        <p class="highlight-text" style="margin-top: 16px;">
          With a <span class="highlight-number">${conversionRate}%</span> conversion rate, this represents 
          <span class="highlight-number">${potentialCustomers}</span> potential new customers monthly, worth 
          <span class="highlight-number">${formatCurrency(
            potentialRevenue
          )}</span> in additional revenue.
        </p>
      </div>
    </div>
    
    <!-- Current Performance -->
    <div class="section">
      <h2 class="section-title">
        <div class="section-icon">📈</div>
        Current Performance Overview
      </h2>
      <p style="color: #6b7280; margin-bottom: 32px; font-size: 16px; line-height: 1.6;">
        Your website's current ranking distribution across <strong>${
          currentRankings.total
        }</strong> relevant keywords:
      </p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${currentRankings.top3}</div>
          <div class="stat-label">Top 3 Rankings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${currentRankings.top10}</div>
          <div class="stat-label">Top 10 Rankings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${currentRankings.top50}</div>
          <div class="stat-label">Top 50 Rankings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${currentRankings.top100}</div>
          <div class="stat-label">Top 100 Rankings</div>
        </div>
      </div>
    </div>
    
    <!-- Revenue Opportunity -->
    <div class="section">
      <h2 class="section-title">
        <div class="section-icon">💰</div>
        Revenue Opportunity Breakdown
      </h2>
      <p style="color: #6b7280; margin-bottom: 32px; font-size: 16px; line-height: 1.6;">
        Your potential monthly revenue if you achieved top rankings for the analyzed keywords:
      </p>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 32px; border-radius: 16px; border: 2px solid #0ea5e9;">
        <div class="metric-row">
          <span class="metric-label">Monthly Search Volume</span>
          <span class="metric-value">${formatNumber(totalSearchVolume)}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Potential Monthly Traffic</span>
          <span class="metric-value">${formatNumber(potentialTraffic)}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Expected Conversion Rate</span>
          <span class="metric-value">${conversionRate}%</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Potential Monthly Customers</span>
          <span class="metric-value">${potentialCustomers}</span>
        </div>
        <div class="metric-row" style="border-top: 2px solid #0ea5e9; padding-top: 20px; margin-top: 16px;">
          <span class="metric-label" style="font-size: 18px; font-weight: 700;">Potential Monthly Revenue</span>
          <span class="metric-value metric-highlight">${formatCurrency(
            potentialRevenue
          )}</span>
        </div>
      </div>
    </div>
    
    <!-- Competitive Analysis -->
    <div class="section">
      <h2 class="section-title">
        <div class="section-icon">🏆</div>
        Competitive Landscape
      </h2>
      <p style="color: #6b7280; margin-bottom: 24px; font-size: 16px; line-height: 1.6;">
        See how you compare against your top ${
          basicInfo.analysisScope === "local" ? "local" : "national"
        } competitors:
      </p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Website</th>
              <th style="text-align: center;">Top 3</th>
              <th style="text-align: center;">Top 10</th>
              <th style="text-align: center;">Top 50</th>
            <tr>
              <th>Website</th>
              <th style="text-align: center;">Top 3</th>
              <th style="text-align: center;">Top 10</th>
              <th style="text-align: center;">Top 50</th>
              <th style="text-align: center;">Top 100</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 3px solid #3b82f6; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);">
              <td style="font-weight: 800; color: #1e40af; font-size: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
                  ${basicInfo.businessUrl}
                </div>
              </td>
              <td style="text-align: center; font-weight: 800; color: #059669; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 8px;">${
                currentRankings.top3
              }</td>
              <td style="text-align: center; font-weight: 800; color: #2563eb; background: linear-gradient(135deg, #dbeafe, #93c5fd); border-radius: 8px;">${
                currentRankings.top10
              }</td>
              <td style="text-align: center; font-weight: 800; color: #d97706; background: linear-gradient(135deg, #fef3c7, #fcd34d); border-radius: 8px;">${
                currentRankings.top50
              }</td>
              <td style="text-align: center; font-weight: 700; color: #6b7280;">${
                currentRankings.top100
              }</td>
            </tr>
            ${competitorComparison}
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Top Keywords -->
    <div class="section">
      <h2 class="section-title">
        <div class="section-icon">🔍</div>
        Top Keyword Opportunities
      </h2>
      <p style="color: #6b7280; margin-bottom: 24px; font-size: 16px; line-height: 1.6;">
        Your biggest opportunities ranked by search volume and current performance:
      </p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Keyword</th>
              <th style="text-align: center;">Monthly Searches</th>
              <th style="text-align: center;">Current Rank</th>
            </tr>
          </thead>
          <tbody>
            ${keywordRows}
          </tbody>
        </table>
      </div>
      
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 12px; margin-top: 24px; border: 2px solid #f59e0b;">
        <h4 style="color: #92400e; font-weight: 800; margin-bottom: 8px; font-size: 16px;">💡 Quick Win Opportunity</h4>
        <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">
          Focus on improving rankings for high-volume keywords where you're currently ranking between positions 11-50 for the fastest ROI.
        </p>
      </div>
    </div>
    
    <!-- Call to Action -->
    <div class="cta-section">
      <h3 class="cta-title">🚀 Ready to Unlock This Revenue Potential?</h3>
      <p class="cta-subtitle">
        Let's discuss a customized SEO strategy to turn these opportunities into real revenue growth for your business.
      </p>
      <a href="https://www.progini.ai" class="button">Schedule Your Free Strategy Call</a>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-title">Report Details</div>
      <p style="margin-bottom: 16px; line-height: 1.6;">
        This comprehensive analysis was generated using current search data, industry benchmarks, and competitive intelligence. 
        Results are based on proven SEO methodologies and may vary based on implementation strategy and market conditions.
      </p>
      <p style="font-weight: 700; color: #374151; margin-bottom: 8px;">© ${new Date().getFullYear()} Progini AI. All rights reserved.</p>
      <p>Professional SEO Services | 123 SEO Street, Digital City, DC 12345</p>
    </div>
  </div>
</body>
</html>
`;
}
