# Testing Lumora Extensions

This guide will help you test both the Standard and Premium versions of Lumora.

## Setup Instructions

1. Run `setup-dev.bat` to install necessary development tools and compile both extensions
2. Open VS Code
3. Press `F5` in each extension folder to launch a new VS Code instance with the extension

## Testing Standard Version Features

### 1. Pomodoro Timer
- Press `Ctrl+Shift+P` and type "Lumora: Toggle Pomodoro Timer"
- Verify timer appears in status bar
- Check timer countdown
- Test pause/resume functionality
- Test reset functionality

### 2. Eye Strain Prevention
- Press `Ctrl+Shift+P` and type "Lumora: Toggle Eye Strain Prevention"
- Wait for break reminder (shortened to 1 minute for testing)
- Test break interface
- Verify timer countdown during break

### 3. Sound Effects
- Press `Ctrl+Shift+P` and type "Lumora: Toggle Sound Effects"
- Type some text to hear typing sounds
- Delete text to hear delete sounds
- Adjust volume in settings

## Testing Premium Version Features

### 1. All Standard Features
- Test all standard features as above
- Verify enhanced UI and notifications

### 2. Biometric Analysis
- Press `Ctrl+Shift+P` and type "Lumora Premium: Show Biometric Analysis"
- Check real-time monitoring panel
- Test stress level indicators
- Try breathing exercise feature

### 3. Flow State Detection
- Press `Ctrl+Shift+P` and type "Lumora Premium: Show Flow State"
- Code for a few minutes to see flow state analysis
- Check productivity suggestions
- Verify flow state indicators

### 4. Enhanced Analytics
- Press `Ctrl+Shift+P` and type "Lumora Premium: Show Productivity Analytics"
- Check detailed metrics
- Verify data visualization
- Test trend analysis features

## Test Files

Create a new file and paste this code to test typing analysis:

```python
def test_typing_analysis():
    # This is a test function to generate typing activity
    print("Testing typing analysis...")
    
    # Loop to generate more activity
    for i in range(10):
        print(f"Processing item {i}")
        
    # Add some calculations
    result = sum([x * 2 for x in range(5)])
    print(f"Final result: {result}")

# Run the test
if __name__ == "__main__":
    test_typing_analysis()
```

## Common Issues and Solutions

### Issue: Extension not appearing
- Reload VS Code window (`Ctrl+R`)
- Check Output panel for errors
- Verify extension is enabled in Extensions panel

### Issue: Features not responding
- Check VS Code Developer Tools (Help > Toggle Developer Tools)
- Look for errors in the Console
- Verify configuration in Settings

### Issue: Performance problems
- Check CPU usage in Task Manager
- Disable other extensions temporarily
- Clear VS Code workspace cache

## Reporting Issues

If you encounter any bugs or issues:
1. Check the console for error messages
2. Take a screenshot if possible
3. Note the steps to reproduce the issue
4. Create an issue in the repository with all details
