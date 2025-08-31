# Digitally Notarized Contracts - Theme Guide

## 🎨 Color Palette

Our sophisticated three-color palette inspired by slumber.fm creates a professional, trustworthy, and modern appearance:

### Primary Colors

| Color | Hex Code | Usage | Description |
|-------|----------|--------|-------------|
| **Deep Navy** | `#051622` | Primary text, headers, dark elements | Professional, trustworthy foundation |
| **Teal Green** | `#1ba098` | Primary actions, success states, accents | Modern, confident, progress |
| **Warm Beige** | `#deb992` | Secondary accents, highlights, warm touches | Sophisticated, approachable, premium |

### Color Applications

#### Deep Navy (#051622)
- **Primary text content** - `text-[#051622]`
- **Headers and titles** - `text-[#051622]`
- **Navigation text** - `text-[#051622]`
- **Primary gradients** - `from-[#051622]`
- **Button text overlays** - Used with opacity for subtle text
- **Borders for definition** - `border-[#051622]/10` to `border-[#051622]/30`

#### Teal Green (#1ba098)  
- **Primary buttons and CTAs** - `bg-[#1ba098]`
- **Success states and confirmations** - `text-[#1ba098]`, `bg-[#1ba098]`
- **Interactive elements** - Hover states, focus rings
- **Progress indicators** - Loading spinners, progress bars  
- **Active navigation states** - `bg-[#1ba098]/10`
- **Icon accents** - Status indicators, checkmarks

#### Warm Beige (#deb992)
- **Secondary interactive elements** - Hover states for non-primary actions
- **Accent backgrounds** - `bg-[#deb992]/10` for subtle highlighting
- **Favorite/star elements** - `text-[#deb992]` for favorites
- **Warm highlights** - Secondary gradient stops
- **Subtle borders** - `border-[#deb992]/50` for soft definition

## 🎭 Usage Patterns

### Gradients
```css
/* Primary Brand Gradient */
bg-gradient-to-r from-[#051622] to-[#1ba098]

/* Subtle Background Gradients */
bg-gradient-to-br from-[#051622]/5 to-[#1ba098]/10
bg-gradient-to-r from-[#1ba098]/10 to-[#deb992]/10
```

### Interactive States
```css
/* Primary Actions */
bg-[#1ba098] hover:bg-[#1ba098]/90
focus:ring-[#1ba098] focus:ring-2

/* Secondary Actions */
border-[#051622]/20 hover:border-[#deb992]/50
text-[#051622]/70 hover:text-[#051622]

/* Success States */
bg-[#1ba098]/10 text-[#051622] border-[#1ba098]/20
```

### Text Hierarchy
```css
/* Primary Text */
text-[#051622]                 /* Main content */
text-[#051622]/70              /* Secondary content */
text-[#051622]/60              /* Tertiary content */
text-[#051622]/40              /* Subtle content */

/* Accent Text */
text-[#1ba098]                 /* Success, active states */
text-[#deb992]                 /* Favorites, special highlights */
```

### Background Layers
```css
/* Page Backgrounds */
bg-white                       /* Primary surface */
bg-[#051622]/5                 /* Subtle tinted background */

/* Component Backgrounds */
bg-[#1ba098]/10                /* Success/active component bg */
bg-[#deb992]/10                /* Warm accent component bg */

/* Interactive Backgrounds */
hover:bg-[#deb992]/5           /* Subtle hover */
hover:bg-[#1ba098]/10          /* Primary hover */
```

## 🔧 Implementation Guidelines

### Component-Level Consistency
1. **Headers**: Use deep navy (#051622) for all titles and headers
2. **CTAs**: Primary actions use teal green (#1ba098) 
3. **Navigation**: Active states use teal green backgrounds with low opacity
4. **Forms**: Focus states use teal green rings
5. **Feedback**: Success uses teal green, favorites use warm beige

### Accessibility Considerations
- All text maintains WCAG AA contrast ratios
- Color is never the only indicator of state
- Focus indicators are clearly visible
- Interactive elements have sufficient color contrast

### Responsive Behavior
- Colors maintain consistency across all screen sizes
- Opacity values may adjust slightly for mobile touch targets
- Gradient directions remain consistent

## 📱 Component Applications

### Navbar
- Background: `bg-white/95` with `border-[#051622]/10`
- Logo: Gradient from deep navy to teal green
- Navigation items: Deep navy text with teal green active states
- User/wallet indicators: Warm color combinations

### Forms
- Inputs: `border-gray-300` default, `focus:ring-[#1ba098]` 
- Submit buttons: Gradient from deep navy to teal green
- Role selections: Teal green borders when active
- Success indicators: Teal green backgrounds with low opacity

### Dropdowns & Search
- Headers: Light deep navy backgrounds
- Selected items: Teal green backgrounds with low opacity  
- Favorites: Warm beige for star indicators
- Hover states: Warm beige backgrounds with very low opacity

### Status Indicators
- Online: Teal green dots
- Success: Teal green checkmarks and backgrounds
- Favorites: Warm beige stars
- Active roles: Deep navy text with teal green accents

This color system creates a cohesive, professional appearance while maintaining excellent usability and accessibility standards.