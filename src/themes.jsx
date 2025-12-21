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
      '--color-primary-2': '#E9D9CA',
      '--color-primary-3': '#4D6080',
      '--color-neutral-1': '#FFFFFF',
      '--color-neutral-2': '#242424',

      '--text-default': '#0F0F0F',
      '--text-accent-1': '#FFFFFF',
      '--text-accent-2': '#242424',
      '--text-accent-3': '#FFFFFF',

    }
  },
  theme3: {
    colors: {
      '--background': '#0F0F0F',
      '--color-primary-1': '#A3B665',
      '--color-primary-2': '#D8E2A7',
      '--color-primary-3': '#F2B5FA',
      '--color-neutral-1': '#FFFFFF',
      '--color-neutral-2': '#242424',

      '--text-default': '#0F0F0F',
      '--text-accent-1': '#242424',
      '--text-accent-2':  '#242424',
      '--text-accent-3': '#242424',

    }
  },
  theme4: {
    colors: {
      '--background': '#dccfcfff',
      '--color-primary-1': '#EB1D15',
      '--color-primary-2': '#E2EB15',
      '--color-primary-3': '#0081EA',
      '--color-neutral-1': '#6e8293ff',
      '--color-neutral-2': '#aaa4a4ff',

       '--text-default': '#0F0F0F',     
      '--text-accent-1': '#0F0F0F', 
      '--text-accent-2': '#0F0F0F', 
      '--text-accent-3': '#0F0F0F', 

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
      '--background': '#0F0F0F',
      '--color-primary-1': '#FF6B9D',
      '--color-primary-2': '#FFAED7',
      '--color-primary-3': '#C44569',
      '--color-neutral-1': '#FFFFFF',
      '--color-neutral-2': '#242424',

      '--text-default': '#0F0F0F',
      '--text-accent-1': '#242424',
      '--text-accent-2': '#242424',
      '--text-accent-3': '#242424',

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
