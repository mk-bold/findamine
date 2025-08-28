export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-800 mb-3">⚠️ Important Legal Notice</h2>
            <p className="text-yellow-700">
              By using Findamine, you acknowledge and agree to these terms. Please read them carefully.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using the Findamine application and services, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Age Requirements</h2>
            <p className="mb-4">
              <strong>Minimum Age:</strong> You must be at least 13 years old to use Findamine. Users between 13-18 years old may need parental consent depending on their country or state of residence.
            </p>
            <p className="mb-4">
              <strong>Age Verification:</strong> We will verify your age during registration and may require additional verification if you are under 18.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Technical Limitations and Disclaimers</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-red-800 mb-3">🚨 Critical Disclaimer</h3>
              <p className="text-red-700 mb-3">
                <strong>Technical Glitches and Data Errors:</strong> Findamine relies on location-based data and technology that may experience technical glitches, errors, or inaccuracies. These issues may affect:
              </p>
              <ul className="text-red-700 list-disc pl-6 mb-3">
                <li>Leaderboard points and scoring</li>
                <li>Clue locations and coordinates</li>
                <li>Game progress tracking</li>
                <li>User rankings and achievements</li>
              </ul>
              <p className="text-red-700">
                <strong>We are not responsible for any points lost, game progress lost, or other data issues due to technical problems.</strong>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Physical Safety and Risk</h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-3">⚠️ Safety Warning</h3>
              <p className="text-orange-700 mb-3">
                <strong>Physical Risk:</strong> Findamine involves real-world exploration and travel to various locations. This activity carries inherent risks including:
              </p>
              <ul className="text-orange-700 list-disc pl-6 mb-3">
                <li>Traffic accidents while traveling to locations</li>
                <li>Slips, trips, and falls at clue locations</li>
                <li>Exposure to weather conditions</li>
                <li>Potential encounters with dangerous areas or situations</li>
                <li>Health risks from physical exertion</li>
              </ul>
              <p className="text-orange-700 mb-3">
                <strong>Location Safety:</strong> While we strive to prevent games from including dangerous locations, we cannot guarantee the safety of all areas. Clues may be placed in locations that become dangerous due to:
              </p>
              <ul className="text-orange-700 list-disc pl-6 mb-3">
                <li>Weather conditions</li>
                <li>Construction or maintenance</li>
                <li>Crime or other safety issues</li>
                <li>Natural disasters or emergencies</li>
              </ul>
              <p className="text-orange-700">
                <strong>We are not responsible for any accidents, injuries, or harm that may occur while playing Findamine.</strong>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability and Waiver</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-red-800 mb-3">🚨 Legal Waiver</h3>
              <p className="text-red-700 mb-3">
                By using Findamine, you expressly waive and release any and all claims, rights, and causes of action against:
              </p>
              <ul className="text-red-700 list-disc pl-6 mb-3">
                <li>Findamine LLC and its officers, directors, employees, and agents</li>
                <li>Game managers, administrators, and moderators</li>
                <li>Other players and participants</li>
                <li>Property owners where clues are located</li>
                <li>Any third-party service providers</li>
              </ul>
              <p className="text-red-700 mb-3">
                This waiver applies to any and all claims arising from:
              </p>
              <ul className="text-red-700 list-disc pl-6 mb-3">
                <li>Technical glitches, errors, or data loss</li>
                <li>Physical injuries or accidents</li>
                <li>Property damage</li>
                <li>Emotional distress</li>
                <li>Financial losses</li>
                <li>Any other damages or losses</li>
              </ul>
              <p className="text-red-700">
                <strong>You agree that you will not seek compensation, damages, or any other legal recourse against these parties.</strong>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Conduct and Responsibilities</h2>
            <p className="mb-4">
              As a Findamine user, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and truthful information during registration</li>
              <li>Respect private property and follow local laws and regulations</li>
              <li>Not engage in dangerous or illegal activities while playing</li>
              <li>Not interfere with other players' game experience</li>
              <li>Report any safety concerns or dangerous locations</li>
              <li>Use common sense and prioritize safety over game progress</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Game Rules and Fair Play</h2>
            <p className="mb-4">
              Findamine is designed to be a fun, fair, and safe game. Cheating, exploiting technical issues, or engaging in unfair practices may result in:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Loss of points or achievements</li>
              <li>Temporary or permanent account suspension</li>
              <li>Disqualification from games or prizes</li>
              <li>Legal action if applicable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="mb-4">
              Findamine LLC reserves the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the service constitutes acceptance of updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="mb-4">
              If you have questions about these terms, please contact us at:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">Findamine LLC</p>
              <p>Email: legal@findamine.com</p>
              <p>Address: [Your Business Address]</p>
            </div>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">📋 Summary of Key Points</h2>
            <ul className="text-blue-700 list-disc pl-6">
              <li>You must be at least 13 years old to play</li>
              <li>Technical issues may cause data loss - we're not responsible</li>
              <li>Physical activity carries risks - we're not responsible for injuries</li>
              <li>You waive all rights to legal recourse against Findamine</li>
              <li>Safety first - use common sense while playing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
