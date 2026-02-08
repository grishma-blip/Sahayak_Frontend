import { useState } from 'react';
import { Settings as SettingsIcon, Phone, Plus, Trash2, Volume2, VolumeX, Vibrate } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { voiceService } from '../services/voiceService';

export function Settings({ onClose }: { onClose: () => void }) {
  const {
    emergencyContacts,
    addEmergencyContact,
    removeEmergencyContact,
    language,
    setLanguage,
    voiceEnabled,
    setVoiceEnabled,
    hapticEnabled,
    setHapticEnabled,
  } = useNavigation();

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      addEmergencyContact(newContact);
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddContact(false);
      voiceService.speak('Emergency contact added', 'normal');
    }
  };

  const handleRemoveContact = (id: string, name: string) => {
    removeEmergencyContact(id);
    voiceService.speak(`${name} removed from emergency contacts`, 'normal');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-blue-600 text-white p-6 flex items-center gap-3">
        <SettingsIcon className="w-8 h-8" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Voice & Feedback</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {voiceEnabled ? <Volume2 className="w-6 h-6 text-blue-600" /> : <VolumeX className="w-6 h-6 text-gray-400" />}
                <div>
                  <p className="font-semibold text-gray-900">Voice Guidance</p>
                  <p className="text-sm text-gray-600">Audio navigation instructions</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (!voiceEnabled) {
                    setTimeout(() => voiceService.speak('Voice guidance enabled', 'normal'), 100);
                  }
                }}
                onFocus={() => voiceService.speak('Toggle voice guidance', 'low')}
                className={`w-16 h-8 rounded-full transition-colors ${
                  voiceEnabled ? 'bg-blue-600' : 'bg-gray-300'
                } relative`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    voiceEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Vibrate className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Haptic Feedback</p>
                  <p className="text-sm text-gray-600">Vibration alerts</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setHapticEnabled(!hapticEnabled);
                  voiceService.speak(hapticEnabled ? 'Haptic feedback disabled' : 'Haptic feedback enabled', 'normal');
                }}
                onFocus={() => voiceService.speak('Toggle haptic feedback', 'low')}
                className={`w-16 h-8 rounded-full transition-colors ${
                  hapticEnabled ? 'bg-blue-600' : 'bg-gray-300'
                } relative`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    hapticEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block font-semibold text-gray-900 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as 'en-IN' | 'hi-IN';
                  setLanguage(newLang);
                  setTimeout(() => voiceService.speak(newLang === 'en-IN' ? 'English selected' : 'Hindi selected', 'normal'), 100);
                }}
                onFocus={() => voiceService.speak('Language selector', 'low')}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              >
                <option value="en-IN">English (India)</option>
                <option value="hi-IN">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Emergency Contacts</h2>
            </div>
            <button
              onClick={() => {
                setShowAddContact(true);
                voiceService.speak('Add emergency contact', 'normal');
              }}
              onFocus={() => voiceService.speak('Add contact button', 'low')}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg focus:ring-4 focus:ring-blue-300"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {emergencyContacts.length === 0 && !showAddContact && (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No emergency contacts added</p>
              <p className="text-sm">Add contacts who will be notified in emergencies</p>
            </div>
          )}

          {showAddContact && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                onFocus={() => voiceService.speak('Enter contact name', 'low')}
                className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                onFocus={() => voiceService.speak('Enter phone number', 'low')}
                className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Relationship (e.g., Mother, Friend)"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                onFocus={() => voiceService.speak('Enter relationship', 'low')}
                className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddContact}
                  onFocus={() => voiceService.speak('Save contact', 'low')}
                  className="flex-1 px-4 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:ring-4 focus:ring-blue-300"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddContact(false);
                    setNewContact({ name: '', phone: '', relationship: '' });
                    voiceService.speak('Cancelled', 'normal');
                  }}
                  onFocus={() => voiceService.speak('Cancel', 'low')}
                  className="flex-1 px-4 py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 active:bg-gray-400 focus:ring-4 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{contact.name}</p>
                  <p className="text-gray-600">{contact.phone}</p>
                  {contact.relationship && (
                    <p className="text-sm text-gray-500">{contact.relationship}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveContact(contact.id, contact.name)}
                  onFocus={() => voiceService.speak(`Remove ${contact.name}`, 'low')}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:ring-4 focus:ring-red-300"
                  aria-label={`Remove ${contact.name}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-6 bg-white border-t-4 border-gray-200">
        <button
          onClick={onClose}
          onFocus={() => voiceService.speak('Close settings', 'low')}
          className="w-full px-6 py-4 text-xl font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:ring-4 focus:ring-blue-300"
        >
          Done
        </button>
      </div>
    </div>
  );
}
