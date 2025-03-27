import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import TimerSounds from '../timer/TimerSounds';

const SettingsContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const SettingsHeader = styled.h2`
  color: ${props => props.theme?.primary ?? '#1e88e5'};
  margin-bottom: 2rem;
  font-size: 2rem;
  text-align: center;
  text-shadow: 0 0 10px ${props => (props.theme?.primary ?? '#1e88e5') + '40'};
`;

const SettingsSection = styled.div`
  margin-bottom: 2rem;
  background: ${props => props.theme?.background ?? '#121212'};
  border: 1px solid ${props => (props.theme?.primary ?? '#1e88e5') + '40'};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 0 15px ${props => (props.theme?.primary ?? '#1e88e5') + '20'};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme?.primary ?? '#1e88e5'};
  margin-bottom: 1rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => props.theme?.text ?? '#ffffff'};
  font-size: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => (props.theme?.primary ?? '#1e88e5') + '60'};
  border-radius: 4px;
  background: ${props => props.theme?.background ?? '#121212'};
  color: ${props => props.theme?.text ?? '#ffffff'};
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: ${props => props.theme?.primary ?? '#1e88e5'};
    box-shadow: 0 0 0 2px ${props => (props.theme?.primary ?? '#1e88e5') + '40'};
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ToggleLabel = styled.span`
  color: ${props => props.theme?.text ?? '#ffffff'};
  font-size: 1rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${props => props.theme?.primary ?? '#1e88e5'};
  }
  
  &:checked + span:before {
    transform: translateX(30px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme?.grid ?? '#333'};
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 1rem;
`;

const Button = styled(motion.button)`
  background: ${props => props.$primary ? props.theme?.primary ?? '#1e88e5' : 'transparent'};
  color: ${props => props.$primary ? props.theme?.background ?? '#121212' : props.theme?.primary ?? '#1e88e5'};
  border: 2px solid ${props => props.theme?.primary ?? '#1e88e5'};
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  box-shadow: 0 0 10px ${props => (props.theme?.primary ?? '#1e88e5') + '40'};
  
  &:hover {
    box-shadow: 0 0 15px ${props => (props.theme?.primary ?? '#1e88e5') + '60'};
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ThemeCard = styled(motion.div)`
  border: 2px solid ${props => props.$isSelected ? props.$themeColor.primary : props.theme?.grid ?? '#333'};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  background: ${props => props.theme?.background ?? '#121212'};
  box-shadow: ${props => props.$isSelected ? `0 0 15px ${props.$themeColor.primary}` : 'none'};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.$themeColor.primary};
    box-shadow: 0 0 10px ${props => (props.$themeColor.primary ?? '#1e88e5') + '40'};
  }
`;

const ThemeName = styled.h4`
  color: ${props => props.$themeColor?.primary ?? props.theme?.primary ?? '#1e88e5'};
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 1.1rem;
`;

const ThemeColorPreview = styled.div`
  height: 20px;
  border-radius: 2px;
  background: ${props => props.$color ?? '#1e88e5'};
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const CharacterCard = styled(motion.div)`
  border: 2px solid ${props => props.$isSelected ? props.theme?.primary ?? '#1e88e5' : props.theme?.grid ?? '#333'};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  background: ${props => props.theme?.background ?? '#121212'};
  box-shadow: ${props => props.$isSelected ? `0 0 15px ${props.theme?.primary ?? '#1e88e5'}` : 'none'};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme?.primary ?? '#1e88e5'};
    box-shadow: 0 0 10px ${props => (props.theme?.primary ?? '#1e88e5') + '40'};
  }
`;

const CharacterName = styled.h4`
  color: ${props => props.theme?.primary ?? '#1e88e5'};
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 1.1rem;
`;

const CharacterDescription = styled.p`
  color: ${props => props.theme?.text ?? '#ffffff'};
  font-size: 0.9rem;
  text-align: center;
`;

const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ConfirmationDialog = styled(motion.div)`
  background-color: ${props => props.theme?.background ?? '#121212'};
  border: 1px solid ${props => (props.theme?.primary ?? '#1e88e5') + '40'};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 0 15px ${props => (props.theme?.primary ?? '#1e88e5') + '20'};
  width: 400px;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const Settings = () => {
  const { focusData, updateSettings, getAvailableThemes, getAvailableCharacters, getCurrentTheme, resetData } = useData();
  const [settings, setSettings] = useState({ ...focusData.settings });
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Get available themes and characters
  const availableThemes = getAvailableThemes();
  const availableCharacters = getAvailableCharacters();
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSave = () => {
    updateSettings(settings);
    // Show a notification or feedback that settings were saved
    if (settings.notifications && typeof Notification !== 'undefined') {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          Notification.requestPermission();
        } catch (error) {
          console.log('Notification API not supported in this environment');
        }
      }
    }
  };
  
  const testSound = () => {
    if (settings.sound) {
      TimerSounds.play('digital');
    }
  };
  
  const selectTheme = (themeId) => {
    setSettings(prev => ({ ...prev, theme: themeId }));
  };
  
  const selectCharacter = (characterId) => {
    setSettings(prev => ({ ...prev, character: characterId }));
  };
  
  return (
    <SettingsContainer>
      <SettingsHeader>Settings</SettingsHeader>
      
      <SettingsSection>
        <SectionTitle>⏱️ Timer Settings</SectionTitle>
        <FormGroup>
          <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
          <Input 
            type="number" 
            id="focusDuration" 
            name="focusDuration" 
            min="1" 
            max="120" 
            value={settings.focusDuration} 
            onChange={handleInputChange} 
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="shortBreakDuration">Short Break Duration (minutes)</Label>
          <Input 
            type="number" 
            id="shortBreakDuration" 
            name="shortBreakDuration" 
            min="1" 
            max="30" 
            value={settings.shortBreakDuration} 
            onChange={handleInputChange} 
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="longBreakDuration">Long Break Duration (minutes)</Label>
          <Input 
            type="number" 
            id="longBreakDuration" 
            name="longBreakDuration" 
            min="5" 
            max="60" 
            value={settings.longBreakDuration} 
            onChange={handleInputChange} 
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="sessionsBeforeLongBreak">Sessions Before Long Break</Label>
          <Input 
            type="number" 
            id="sessionsBeforeLongBreak" 
            name="sessionsBeforeLongBreak" 
            min="1" 
            max="10" 
            value={settings.sessionsBeforeLongBreak} 
            onChange={handleInputChange} 
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="sessionsPerDay">Daily Session Goal</Label>
          <Input 
            type="number" 
            id="sessionsPerDay" 
            name="sessionsPerDay" 
            min="1" 
            max="20" 
            value={settings.sessionsPerDay} 
            onChange={handleInputChange} 
          />
        </FormGroup>
      </SettingsSection>
      
      <SettingsSection>
        <SectionTitle>🎨 Theme Settings</SectionTitle>
        <p>Choose a theme that matches your character's identity circuit colors</p>
        <ThemeGrid>
          {Object.entries(availableThemes).map(([id, colors]) => {
            return (
              <ThemeCard 
                key={id}
                $isSelected={settings.theme === id}
                $themeColor={{
                  primary: colors.primary,
                  background: colors.background
                }}
                onClick={() => selectTheme(id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThemeName>{id.charAt(0).toUpperCase() + id.slice(1)}</ThemeName>
                <ThemeColorPreview $color={colors.primary} />
              </ThemeCard>
            );
          })}
        </ThemeGrid>
      </SettingsSection>
      
      <SettingsSection>
        <SectionTitle>👤 Character Selection</SectionTitle>
        <CharacterGrid>
          {availableCharacters.map(character => (
            <CharacterCard 
              key={character.id}
              $isSelected={settings.character === character.id}
              onClick={() => selectCharacter(character.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <CharacterName>{character.name}</CharacterName>
              <CharacterDescription>{character.description}</CharacterDescription>
            </CharacterCard>
          ))}
        </CharacterGrid>
      </SettingsSection>
      
      <SettingsSection>
        <SectionTitle>🔔 Notification Settings</SectionTitle>
        <FormGroup>
          <ToggleContainer>
            <ToggleLabel>Enable Notifications</ToggleLabel>
            <ToggleSwitch>
              <ToggleInput 
                type="checkbox" 
                name="notifications" 
                checked={settings.notifications} 
                onChange={handleInputChange} 
              />
              <ToggleSlider />
            </ToggleSwitch>
          </ToggleContainer>
        </FormGroup>
        
        <FormGroup>
          <ToggleContainer>
            <ToggleLabel>Enable Sound</ToggleLabel>
            <ToggleSwitch>
              <ToggleInput 
                type="checkbox" 
                name="sound" 
                checked={settings.sound} 
                onChange={handleInputChange} 
              />
              <ToggleSlider />
            </ToggleSwitch>
          </ToggleContainer>
        </FormGroup>
        
        {settings.sound && (
          <Button 
            onClick={testSound}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Test Sound
          </Button>
        )}
      </SettingsSection>
      
      <SettingsSection>
        <SectionTitle>🔄 Data Management</SectionTitle>
        <p style={{ marginBottom: '15px', color: '#ff5555' }}>
          Warning: Resetting your data will permanently delete all your focus sessions and streak history.
        </p>
        <Button 
          onClick={() => setShowConfirmation(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ backgroundColor: '#ff3333', borderColor: '#ff3333' }}
        >
          Reset All Data
        </Button>
        
        {showConfirmation && (
          <ConfirmationOverlay>
            <ConfirmationDialog
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3>Are you sure?</h3>
              <p>This will delete all your focus sessions and streak history. This action cannot be undone.</p>
              <ConfirmationButtons>
                <Button 
                  onClick={() => {
                    resetData();
                    setShowConfirmation(false);
                  }}
                  style={{ backgroundColor: '#ff3333', borderColor: '#ff3333' }}
                >
                  Yes, Reset Data
                </Button>
                <Button 
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </Button>
              </ConfirmationButtons>
            </ConfirmationDialog>
          </ConfirmationOverlay>
        )}
      </SettingsSection>
      
      <ButtonContainer>
        <Button 
          $primary={true}
          onClick={handleSave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Save Settings
        </Button>
      </ButtonContainer>
    </SettingsContainer>
  );
};

export default Settings;
