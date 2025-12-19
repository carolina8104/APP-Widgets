const THEMES = {
  theme1: {
    colors: {
      '--background': '#0F0F0F',
      '--color-primary-1': '#B7FF2F',
      '--color-primary-2': '#FFE86D',
      '--color-primary-3': '#F9773B',

      '--color-neutral-1': '#FFFFFF',
      '--color-neutral-2': '#242424',

      '--text-default': '#0F0F0F',
      '--text-accent-1': '#0F0F0F',
      '--text-accent-2': '#0F0F0F',
      '--text-accent-3': '#0F0F0F',

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
      '--text-accent-1': 'var(--color-primary-1)',
      '--text-accent-2': 'var(--color-primary-2)',
      '--text-accent-3': 'var(--color-primary-3)',

    }
  },
  theme4: {
    colors: {
      '--background': '#0F0F0F',
      '--color-primary-1': '#FFAED7',
      '--color-primary-2': '#FF6B9D',
      '--color-primary-3': '#2801E8',
      '--color-neutral-1': '#FFFFFF',
      '--color-neutral-2': '#242424',

       '--text-default': '#0F0F0F',     
      '--text-accent-1': 'var(--color-primary-1)',
      '--text-accent-2': 'var(--color-primary-2)',
      '--text-accent-3': 'var(--color-primary-3)',

    }
  },
  theme5: {
    colors: {
      '--background': '#c3bdbdff',
      '--color-primary-1': '#D71A21',
      '--color-primary-2': '#dbd9d9ff',
      '--color-primary-3': '#d6d6d6ff',
      '--color-neutral-1': '#FFFFFF',
      '--color-neutral-2': '#242424',

      '--text-default': '#ffffffff',
      '--text-inverse': '#000000ff',
      '--text-accent-1': '#000000ff',
      '--text-accent-2': '#1d1b1bff',
      '--text-accent-3': '#D71A21',
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
      '--text-accent-1': 'var(--color-primary-1)',
      '--text-accent-2': 'var(--color-primary-2)',
      '--text-accent-3': 'var(--color-primary-3)',

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
