const THEMES = {
  theme1: {
    colors: {
      '--bg': '#0F0F0F',
      '--accent-neon': '#B7FF2F',
      '--accent-orange': '#F9773B',
      '--accent-yellow': '#FFE86D',
      '--white': '#FFFFFF'
    }
  },
  theme2: {
    colors: {
      '--bg': '#f1eeeeff',
      '--accent-neon': '#F4721E',
      '--accent-orange': '#4D6080',
      '--accent-yellow': '#E9D9CA',
      '--white': '#E8F0FF'
    }
  },
  theme3: {
    colors: {
      '--bg': '#0F0F0F',
      '--accent-neon': '#A3B665',
      '--accent-orange': '#F2B5FA',
      '--accent-yellow': '#D8E2A7',
      '--white': '#F5F0FF'
    }
  },
  theme4: {
    colors: {
      '--bg': '#0F0F0F',
      '--accent-neon': '#FFAED7',
      '--accent-orange': '#2801E8',
      '--accent-yellow': '#97B9FF',
      '--white': '#F0E6FF'
    }
  },
  theme5: {
    colors: {
      '--bg': '#0F0F0F',
      '--accent-neon': '#D71A21',
      '--accent-orange': '#3B393E',
      '--accent-yellow': '#FF6B9D',
      '--white': '#FFE6E6'
    }
  },
  theme6: {
    colors: {
      '--bg': '#0F0F0F',
      '--accent-neon': '#FF6B9D',
      '--accent-orange': '#C44569',
      '--accent-yellow': '#FFAED7',
      '--white': '#FFF0F5'
    }
  }
}

function applyTheme(themeId) {
  const theme = THEMES[themeId]
  if (!theme) {
    console.warn('Theme not found:', themeId)
    return
  }
  
  const root = document.documentElement
  Object.entries(theme.colors).forEach(([property, value]) => {
    root.style.setProperty(property, value, 'important')
  })
  
  localStorage.setItem('selectedTheme', themeId)
}
