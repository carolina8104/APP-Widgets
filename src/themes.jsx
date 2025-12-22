const THEMES = {
  theme1: {
    colors: {
      '--background': '#0F0F0F',
      '--color-primary-1': '#B7FF2F',
      '--color-primary-2': '#FFE86D',
      '--color-primary-3': '#F9773B',
      '--color-primary-4': '#97B9FF',

      '--color-neutral-1': '#FFFFFF',
      '--color-neutral-2': '#242424',

      '--text-default': '#0F0F0F',
      '--text-accent-1': '#0F0F0F',
      '--text-accent-2': '#0F0F0F',
      '--text-accent-3': '#0F0F0F',
      '--bar-elements': '#FFFFFF',

    }
  },
  theme2: {
    colors: {
      '--background': '#f1eeeeff',
      '--color-primary-1': '#F4721E',
      '--color-primary-2': '#bdb3a9ff',
      '--color-primary-3': '#4D6080',
      '--color-neutral-1': '#FFFFFF',
      '--color-neutral-2': '#242424',

      '--text-default': '#0F0F0F',
      '--text-accent-1': '#242424',
      '--text-accent-2': '#242424',
      '--text-accent-3': '#FFFFFF',
      '--bar-elements': '#bdb3a9ff',
    }
  },
  theme3: {
    colors: {
      '--background': '#FAF9F6',
      '--color-primary-1': '#ECEAE4',
      '--color-primary-2': '#D6D2C8',
      '--color-primary-3': '#AEB3B0',
      '--color-primary-4': '#8A8F8D',
      '--color-neutral-1': '#E6E4DE',
      '--color-neutral-2': '#FFFFFF',

      '--text-default': '#1F1F1F',
      '--text-inverse': '#FFFFFF',
      '--text-accent-1': '#1F1F1F',
      '--text-accent-2': '#1F1F1F',
      '--text-accent-3': '#1F1F1F',
      '--bar-elements': '#A7A199',
    }

  },
  theme4: {
    colors: {
      '--background': '#EFEDE7',
      '--color-primary-1': '#B7382D',
      '--color-primary-2': '#2E4A7D',
      '--color-primary-3': '#D8B23A',
      '--color-primary-4': '#224e41ff',
      
      '--color-neutral-1': '#575757ff',
      '--color-neutral-2': '#c1bbbbff',
      '--text-default': '#F4F1EC',     
      '--text-accent-1': '#F4F1EC', 
      '--text-accent-2': '#F4F1EC', 
      '--text-accent-3': '#2A2A2A',
      '--bar-elements': '#0F0F0F',
    }
  },
  theme5: {
    colors: {
      '--background': '#181717ff',
      '--color-primary-1':  '#812222ff',
      '--color-primary-2': '#a5a2a2ff',
      '--color-primary-3':  '#812222ff',
      '--color-primary-4': '#6f3333ff',
      '--color-neutral-1': '#ede7e7ff',
      '--color-neutral-2': '#ede7e7ff',

      '--text-default': '#000000ff',
      '--text-inverse': '#ede7e7ff',
      '--text-accent-1':  '#f0e2e3ff',
      '--text-accent-2': '#1d1b1bff',
      '--text-accent-3': '#f0e2e3ff',
      '--bar-elements': '#181717ff',

    }
  },
  theme6: {
    colors: {
      '--background': '#383637ff',
      '--color-primary-1': '#FF6F9F',
      '--color-primary-2': '#FFD1E6',
      '--color-primary-3': '#D64A7C',
      '--color-primary-4': '#c04294ff',
      '--color-neutral-1': '#f6d9e8ff',
      '--color-neutral-2': '#2b2929ff',

      '--text-default': '#0F0F0F',
      '--text-accent-1': '#242424',
      '--text-accent-2': '#242424',
      '--text-accent-3': '#242424',
      '--bar-elements': '#FFD1E6',
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
