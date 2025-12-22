(function() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'theme1'
        const theme = THEMES[savedTheme]
        if (theme) {
          const root = document.documentElement
          Object.entries(theme.colors).forEach(([prop, val]) => root.style.setProperty(prop, val, 'important'))
        }
      })()