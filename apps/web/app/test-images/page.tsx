export default function TestImagesPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">Image Test Page</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Header Banner Test</h2>
          <div className="relative h-64 overflow-hidden rounded-lg">
            <img 
              src="/images/header-banner.png" 
              alt="Header Banner Test"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Footer Banner Test</h2>
          <div className="relative h-64 overflow-hidden rounded-lg">
            <img 
              src="/images/footer-banner.png" 
              alt="Footer Banner Test"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Image URLs</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p><strong>Header:</strong> /images/header-banner.png</p>
            <p><strong>Footer:</strong> /images/footer-banner.png</p>
          </div>
        </div>
      </div>
    </div>
  );
}
