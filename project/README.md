# X-Ray QC Tool - Progressive Web App

A production-ready Progressive Web App (PWA) for quality control testing of mobile X-ray machines. Built with React, TypeScript, and Tailwind CSS, this application runs entirely offline using IndexedDB for data persistence.

![PWA](https://img.shields.io/badge/PWA-Ready-success)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### 🔬 Quality Control Testing
- **kV Accuracy & Repeatability**: Test tube voltage accuracy with automatic statistical calculations (mean, SD, CV, % deviation)
- **Output Repeatability**: Measure dose consistency with automatic pass/fail criteria (CV ≤ 0.05)
- **Output Linearity**: Linear regression analysis with R² calculation and visual chart
- **IEC Compliance**: Built-in tolerance limits based on IEC standards

### 📱 Progressive Web App
- **Offline-First**: Works completely offline after initial load
- **Installable**: Add to home screen on mobile and desktop
- **Responsive Design**: Optimized for tablets (10-inch landscape) and all screen sizes
- **Touch-Friendly**: Minimum 48px button heights for easy use

### 💾 Data Management
- **IndexedDB Storage**: All data stored locally using Dexie.js
- **Session History**: Search, filter, and paginate through past QC sessions
- **PDF Export**: Generate professional PDF reports with hospital logo
- **Bulk Export**: Export multiple sessions to a single PDF document
- **Data Safety**: Confirmation dialogs for destructive operations

### ⚙️ Customization
- **Hospital Logo**: Upload and display custom logo on reports
- **Tolerance Limits**: Adjust pass/fail criteria (default to IEC standards)
- **Settings Persistence**: All preferences saved locally

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/xray-qc-pwa.git
cd xray-qc-pwa

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
The app will be available at `http://localhost:5173`

### Production Build
The production build will be in the `dist/` folder, ready for static hosting.

## Usage Guide

### 1. Dashboard
Start here to access all features:
- **New QC Session**: Begin a new quality control test
- **History**: View past QC sessions
- **Export PDF**: Batch export multiple reports
- **Settings**: Configure app preferences

### 2. New Session Wizard

#### Step 1: Machine Information
Enter basic information:
- Hospital name
- Room location
- X-ray machine model and serial numbers
- Tube and detector serial numbers
- Technician name
- Test date

#### Step 2: kV Accuracy & Repeatability
1. Set nominal kV (e.g., 80 kV)
2. Perform 3 exposures
3. Enter measured kV values
4. View automatic calculations:
   - Mean kV
   - Standard deviation
   - Coefficient of variation
   - % Deviation from nominal
   - Pass/Fail status (±10% or ±5 kV limits)

#### Step 3: Output Repeatability
1. Set nominal mAs (e.g., 2 mAs)
2. Perform 3 exposures
3. Enter dose readings (μGy)
4. View automatic calculations:
   - Mean dose
   - Standard deviation
   - Coefficient of variation
   - Pass/Fail status (CV ≤ 0.05)

#### Step 4: Output Linearity
1. Enter at least 4 mAs/dose pairs
2. View automatic calculations:
   - Linear regression slope
   - R² correlation coefficient
   - Visual scatter plot with fitted line
   - Pass/Fail status (R² ≥ 0.98)

### 3. History
- Search sessions by hospital, model, technician, or date
- View overall pass/fail status at a glance
- Click "View" to see full report
- Delete unwanted sessions

### 4. Reports
- Print-friendly layout
- Hospital logo (if configured)
- Complete test results
- Overall pass/fail status
- Export to PDF with one click

### 5. Settings
- Upload hospital logo (converts to base64 for offline use)
- Adjust tolerance limits:
  - kV Deviation Limit (default: 10%)
  - kV Absolute Limit (default: 5 kV)
  - Repeatability CV Limit (default: 0.05)
  - Linearity R² Limit (default: 0.98)
- Delete all data (with double confirmation)

## Technical Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Database**: IndexedDB (via Dexie.js)
- **Charts**: Chart.js
- **PDF Generation**: jsPDF + html2canvas
- **Build Tool**: Vite
- **PWA**: Vite PWA Plugin with Workbox

### Project Structure
```
src/
├── components/       # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── pages/           # Route pages
│   ├── Dashboard.tsx
│   ├── NewSession.tsx
│   ├── History.tsx
│   ├── Report.tsx
│   ├── ExportPDF.tsx
│   └── Settings.tsx
├── db/              # Database layer
│   └── database.ts
├── utils/           # Utility functions
│   └── calculations.ts
├── App.tsx          # Root component with routing
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

### Data Schema

#### QCSession
```typescript
{
  id: number;
  hospital: string;
  room: string;
  model: string;
  serial: string;
  tubeSerial: string;
  detectorSerial: string;
  techName: string;
  date: string;
  kvTest: {
    nominalKv: number;
    readings: number[];
    mean: number;
    sd: number;
    cv: number;
    deviation: number;
    passed: boolean;
  };
  repeatabilityTest: {
    nominalMas: number;
    readings: number[];
    mean: number;
    sd: number;
    cv: number;
    passed: boolean;
  };
  linearityTest: {
    data: Array<{ mas: number; dose: number }>;
    slope: number;
    rSquared: number;
    passed: boolean;
  };
  createdAt: number;
}
```

#### Settings
```typescript
{
  id: number;
  hospitalLogo: string;  // base64 encoded image
  kvDeviationLimit: number;
  kvAbsoluteLimit: number;
  repeatabilityCvLimit: number;
  linearityRSquaredLimit: number;
}
```

## Deployment

### GitHub Pages (Free Hosting)

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions

2. **Update vite.config.ts**:
   ```typescript
   base: '/your-repo-name/'
   ```

3. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Deploy PWA"
   git push origin main
   ```

4. **Access your app**:
   `https://yourusername.github.io/your-repo-name/`

The GitHub Actions workflow automatically:
- Installs dependencies
- Builds the production bundle
- Deploys to GitHub Pages

### Other Static Hosts
The `dist/` folder can be deployed to:
- Netlify
- Vercel
- Cloudflare Pages
- Any static web hosting

## PWA Features

### Service Worker
- Automatic caching of all assets
- Offline functionality
- Background sync capability

### Manifest
- App name: "X-Ray QC Tool"
- Theme color: #2563eb (blue)
- Display: standalone
- Orientation: landscape (optimized for tablets)

### Lighthouse Scores Target
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- PWA: 90+

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with PWA support

## Security & Privacy
- **No external servers**: All data stays on the device
- **No tracking**: No analytics or third-party scripts
- **Offline-first**: No network requests required after initial load
- **HTTPS recommended**: For PWA installation

## Testing Calculations

### kV Accuracy Formula
```
Deviation (%) = ((Mean - Nominal) / Nominal) × 100
Pass if: |Deviation| ≤ 10% AND |Mean - Nominal| ≤ 5 kV
```

### Repeatability Formula
```
CV = SD / Mean
Pass if: CV ≤ 0.05
```

### Linearity Formula
```
Linear regression: Y = slope × X (forced through origin)
R² = 1 - (SS_residual / SS_total)
Pass if: R² ≥ 0.98
```

## Troubleshooting

### PWA Not Installing
1. Ensure HTTPS is enabled (required for PWA)
2. Check browser console for service worker errors
3. Verify manifest.json is loading correctly

### Data Not Persisting
1. Check browser IndexedDB support
2. Ensure sufficient storage quota
3. Check browser privacy settings (IndexedDB may be disabled)

### PDF Export Not Working
1. Check browser console for library load errors
2. Ensure CDN scripts are loading (Chart.js, jsPDF, html2canvas)
3. Try with a stable internet connection for first load

### Chart Not Displaying
1. Verify Chart.js CDN script is loaded
2. Check browser console for errors
3. Ensure data has at least 4 linearity points

## Contributing
Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
MIT License - see LICENSE file for details

## Support
For issues or questions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

## Acknowledgments
- Built with React, TypeScript, and Vite
- Icons from Heroicons
- Charts from Chart.js
- PDF generation from jsPDF and html2canvas
- Database from Dexie.js

---

**Note**: This tool is for quality control testing purposes. Always follow your institution's protocols and regulatory requirements for medical device testing.
