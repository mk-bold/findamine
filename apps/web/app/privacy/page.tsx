export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">🔒 Your Privacy Matters</h2>
            <p className="text-blue-700">
              This policy explains how Findamine collects, uses, and protects your personal information.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Age Requirements and Consent</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Age Restrictions</h3>
              <p className="text-yellow-700 mb-3">
                <strong>Minimum Age:</strong> You must be at least 13 years old to use Findamine. The specific age requirement may vary by country or US state:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-yellow-800">Age 14:</h4>
                  <ul className="text-yellow-700 list-disc pl-4">
                    <li>Austria, Bulgaria, Italy</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800">Age 15:</h4>
                  <ul className="text-yellow-700 list-disc pl-4">
                    <li>France, Norway</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800">Age 16:</h4>
                  <ul className="text-yellow-700 list-disc pl-4">
                    <li>Germany, Hungary, Lithuania, Luxembourg, Slovakia, Netherlands, Australia, Georgia (US), Florida (US)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800">Age 17-18:</h4>
                  <ul className="text-yellow-700 list-disc pl-4">
                    <li>Nevada (17), Texas (18), Louisiana (18)</li>
                  </ul>
                </div>
              </div>
              <p className="text-yellow-700 mt-3">
                <strong>All other countries and US states:</strong> Minimum age 13
              </p>
            </div>
            <p className="mb-4">
              Users under the age of 18 may require parental consent depending on their location. We will verify your age during registration and may require additional verification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="mb-4">We collect the following types of information:</p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Email address</li>
              <li>Gamer tag (username)</li>
              <li>First and last name</li>
              <li>Date of birth</li>
              <li>Country and state of residence</li>
              <li>Password (encrypted)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Profile Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Profile picture</li>
              <li>Status messages</li>
              <li>Home city</li>
              <li>Favorite play zones</li>
              <li>Hobbies and interests</li>
              <li>Education and work history</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Game Activity Data</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Games played and progress</li>
              <li>Clues found and locations visited</li>
              <li>Points earned and leaderboard rankings</li>
              <li>Team memberships and social connections</li>
              <li>Chat posts and communications</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Technical Data</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address and location data</li>
              <li>Device information (browser, OS, hardware)</li>
              <li>Usage analytics and page views</li>
              <li>Login attempts and authentication data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and improve our gaming services</li>
              <li>Verify your age and eligibility</li>
              <li>Personalize your gaming experience</li>
              <li>Track game progress and achievements</li>
              <li>Facilitate social interactions between players</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Photo Sharing and Data Ownership</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">📸 Photo Uploads and Sharing</h3>
              <p className="text-yellow-700 mb-3">
                <strong>Photo Ownership:</strong> When you upload photos to Findamine, they become shared data that is the property of the game and Findamine LLC. This includes:
              </p>
              <ul className="text-yellow-700 list-disc pl-6 mb-3">
                <li>Photos uploaded as part of clue findings</li>
                <li>Photos shared in game chat or message boards</li>
                <li>Photos uploaded for game center or clue locations</li>
                <li>Any other photos uploaded to the platform</li>
              </ul>
              <p className="text-yellow-700 mb-3">
                <strong>Public Sharing:</strong> Uploaded photos may be:
              </p>
              <ul className="text-yellow-700 list-disc pl-6 mb-3">
                <li>Visible to all players in the game</li>
                <li>Used by game managers to highlight favorite photos</li>
                <li>Featured in game promotional materials</li>
                <li>Shared with other players and game participants</li>
              </ul>
              <p className="text-yellow-700">
                <strong>Important:</strong> Before uploading photos, ensure you are comfortable with them being shared publicly and becoming part of the game's shared content.
              </p>
            </div>

          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Third Parties</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">🛡️ Paid Users - Enhanced Privacy</h3>
              <p className="text-green-700">
                <strong>If you purchase the paid version of Findamine:</strong> Your personal data will NOT be shared with any third parties for advertising or marketing purposes. Your information remains completely private and secure.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-3">⚠️ Free Users - Data Sharing</h3>
              <p className="text-orange-700 mb-3">
                <strong>If you use the free version of Findamine:</strong> We may share certain data with registered and validated data aggregators who will use this information to provide:
              </p>
              <ul className="text-orange-700 list-disc pl-6 mb-3">
                <li>Targeted advertisements</li>
                <li>Behavioral advertising</li>
                <li>Market research and analytics</li>
                <li>Product recommendations</li>
              </ul>
              <p className="text-orange-700">
                <strong>Data elements that may be shared include:</strong>
              </p>
              <ul className="text-orange-700 list-disc pl-6">
                <li>Age range and demographic information</li>
                <li>Geographic location (country/state)</li>
                <li>Gaming preferences and interests</li>
                <li>Device and browser information</li>
                <li>Usage patterns and activity levels</li>
                <li>Social connections and team memberships</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Providers</h3>
            <p className="mb-4">
              We may share data with trusted service providers who help us operate our platform (hosting, analytics, customer support, etc.). These providers are bound by strict confidentiality agreements.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Legal Requirements</h3>
            <p className="mb-4">
              We may disclose information if required by law, court order, or government request, or to protect the rights and safety of our users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">🔒 Security Measures</h3>
              <p className="text-blue-700 mb-3">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="text-blue-700 list-disc pl-6">
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure servers with regular security audits</li>
                <li>Two-factor authentication options</li>
                <li>Regular security updates and patches</li>
                <li>Limited access to personal data by employees</li>
                <li>Secure data transmission protocols</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access and review your personal data</li>
              <li>Update or correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of data sharing (by upgrading to paid version)</li>
              <li>Request data portability</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="mb-4">
              We retain your data for as long as your account is active or as needed to provide services. If you delete your account, we will remove your personal data within 30 days, except where required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="mb-4">
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will notify you of significant changes via email or through the app, and continued use constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this privacy policy or want to exercise your rights, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">Findamine LLC</p>
              <p>Email: privacy@findamine.com</p>
              <p>Data Protection Officer: dpo@findamine.app</p>
              <p>Address: 153 W. 160 N., Vineyard, UT 84059</p>
            </div>
          </section>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-12">
            <h2 className="text-xl font-semibold text-purple-800 mb-3">📋 Privacy Summary</h2>
            <ul className="text-purple-700 list-disc pl-6">
              <li>Minimum age: 13+ (varies by location)</li>
              <li>Free users: Data may be shared with advertisers</li>
              <li>Paid users: Complete data privacy, no third-party sharing</li>
              <li>Strong security measures protect your data</li>
              <li>You control your data and can delete your account anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
