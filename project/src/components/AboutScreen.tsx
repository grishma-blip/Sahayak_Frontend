import { Shield, Navigation, AlertTriangle, Phone, Volume2, Vibrate } from 'lucide-react';

export function AboutScreen() {
  const features = [
    {
      icon: Navigation,
      title: 'Smart Navigation',
      description: 'Voice-guided turn-by-turn directions with real-time path correction',
    },
    {
      icon: AlertTriangle,
      title: 'Hazard Detection',
      description: 'Instant alerts for obstacles, potholes, and dangerous terrain',
    },
    {
      icon: Phone,
      title: 'Emergency SOS',
      description: 'Automatic fall detection with countdown alerts to caregivers',
    },
    {
      icon: Volume2,
      title: 'Voice Interface',
      description: 'Natural language commands in English and Hindi',
    },
    {
      icon: Vibrate,
      title: 'Haptic Feedback',
      description: 'Non-verbal vibration patterns for directional guidance',
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Priority alerts for immediate dangers with emergency stop signals',
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8">
        <h1 className="text-4xl font-bold mb-3">SafePath Navigator</h1>
        <p className="text-xl text-blue-100">
          Assistive navigation for visually impaired individuals in urban Indian environments
        </p>
      </div>

      <div className="p-6 space-y-6">
        <section className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About This App</h2>
          <div className="space-y-3 text-gray-700">
            <p className="text-lg leading-relaxed">
              SafePath Navigator addresses the unique challenges faced by visually impaired individuals
              navigating the "organized chaos" of Indian city streets.
            </p>
            <p className="text-lg leading-relaxed">
              Traditional GPS navigation lacks the granular detail needed to identify real-world hazards
              like open manholes, uneven footpaths, or street vendors. Our app bridges this critical
              safety gap.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Features</h2>
          <div className="grid gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Enter Your Destination</h3>
                <p className="text-gray-600">Use voice input or type your destination</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Follow Voice Guidance</h3>
                <p className="text-gray-600">Receive turn-by-turn audio instructions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Stay Alert to Hazards</h3>
                <p className="text-gray-600">Get instant warnings about obstacles and dangers</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Emergency Protection</h3>
                <p className="text-gray-600">Automatic fall detection alerts your emergency contacts</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-2">Demo Mode</h2>
          <p className="text-blue-800">
            This is a demonstration version. Use the simulation buttons to test hazard detection
            and emergency features. In production, these would be triggered automatically by sensors
            and computer vision.
          </p>
        </section>

        <div className="text-center text-sm text-gray-500 pb-4">
          <p>Version 1.0.0</p>
          <p className="mt-1">Built with accessibility and safety in mind</p>
        </div>
      </div>
    </div>
  );
}
