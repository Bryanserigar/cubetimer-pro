# Rubik's Cube Timer - Design Style Guide

## Design Philosophy

### Visual Language
**Modern Speedcubing Aesthetic**: Clean, precision-focused design that reflects the technical nature of speedcubing while maintaining visual appeal. The design emphasizes clarity, functionality, and performance metrics.

**Color Palette**: 
- Primary: Deep charcoal (#1a1a1a) background for reduced eye strain during long sessions
- Accent: Electric cyan (#00d4ff) for active elements and highlights
- Secondary: Soft white (#f8f8f8) for primary text
- Success: Neon green (#00ff88) for personal bests and achievements
- Warning: Amber (#ffa500) for inspection countdown
- Error: Coral red (#ff6b6b) for DNFs and errors

**Typography**:
- Display: "JetBrains Mono" for timer display - monospace ensures consistent character spacing
- Body: "Inter" for UI text - clean, highly legible sans-serif
- All text maintains 4.5:1 contrast ratio for accessibility

### Visual Effects

**Used Libraries**:
- **Anime.js**: Smooth timer animations, button interactions, and state transitions
- **p5.js**: Dynamic background particle system representing cube pieces in motion
- **ECharts.js**: Statistics visualization with custom speedcubing-themed styling
- **Splitting.js**: Character-by-character text animations for scramble display
- **Typed.js**: Typewriter effect for welcome messages and tips

**Background Effects**:
- Subtle particle system with small geometric shapes representing cube pieces
- Gentle floating animation with physics-based movement
- Dark gradient overlay ensuring text readability
- Responsive particle density based on screen size

**Animation Principles**:
- **Timer Display**: Smooth counting animation with subtle glow effect on active state
- **Button Interactions**: Micro-interactions with scale and color transitions
- **Scramble Generation**: Satisfying reveal animation for new scrambles
- **Statistics Updates**: Smooth chart transitions and number counting animations
- **State Changes**: Fade transitions between different timer states (ready/inspecting/solving)

### Header Effect
**Dynamic Cube Visualization**: 
- 3D-style CSS cube in header that rotates subtly
- Represents current scramble state with color-coded faces
- Smooth rotation animation using CSS transforms
- Responsive sizing that scales with viewport

### Interactive Elements

**Timer Interface**:
- Large, prominent display with subtle inner shadow and glow
- Color-coded states: blue (ready), amber (inspecting), green (solving)
- Satisfying button press animations with haptic-style feedback
- Visual countdown indicators for inspection period

**Scramble Display**:
- Monospace font with proper spacing for cube notation
- Copy-to-clipboard functionality with success animation
- Visual separation of move groups for readability
- Hover effects revealing scramble difficulty metrics

**Statistics Dashboard**:
- Clean card-based layout with subtle shadows
- Interactive charts with hover details
- Achievement badges with unlock animations
- Progress bars with smooth fill animations

### Responsive Design
- Mobile-first approach with touch-friendly interface
- Adaptive font sizes maintaining readability
- Collapsible navigation for smaller screens
- Optimized particle effects for performance on mobile
- Gesture support for timer controls

### Accessibility Features
- High contrast color combinations
- Keyboard navigation support
- Screen reader compatible labels
- Focus indicators for all interactive elements
- Reduced motion options for users with vestibular disorders