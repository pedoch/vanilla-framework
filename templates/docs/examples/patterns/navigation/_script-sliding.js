const toggleClasses = ['.p-navigation__item--dropdown-toggle', '.p-navigation__item--dropdown-close'];

let lastDropdown;
let wasClosed;

function toggleDropdown(toggle, open, fromCloseAllDropdowns) {
  let parentElement;

  wasClosed = false;

  const navigationPlane = document.querySelector('.p-navigation__plane');
  const navigationOverlay = document.querySelector('.p-navigation__nav-overlay');

  if (toggle.parentNode.classList.contains('p-navigation__item--dropdown-close')) {
    parentElement = toggle.parentNode.parentNode.parentNode;
  } else {
    parentElement = toggle.parentNode;
  }

  const dropdown = document.getElementById(toggle.getAttribute('aria-controls'));

  dropdown.setAttribute('aria-hidden', !open);

  const dropdownLevel = dropdown.getAttribute('data-level');

  if (open) {
    parentElement.classList.add('is-active');

    const parentSlide = parentElement.closest('.p-navigation__dropdown, .p-navigation__plane');

    // scroll to top of dropdown when opening it to make sure animation is visible
    if (parentSlide) {
      parentSlide.scrollTop = 0;
    }

    if (!fromCloseAllDropdowns) {
      navigationOverlay.classList.add('p-fade-in-overlay');

      // set the active level animation based on dropdown level
      if (dropdownLevel === '1') {
        navigationPlane.classList.add('open-level-1');
      } else if (dropdownLevel === '2') {
        navigationPlane.classList.add('open-level-2');
      }
    }
  } else {
    wasClosed = true;

    if (!fromCloseAllDropdowns) {
      navigationOverlay.classList.add('p-fade-out-overlay');

      // remove the active level animation based on dropdown level
      if (dropdownLevel === '1') {
        navigationPlane.classList.add('close-level-1');
      } else if (dropdownLevel === '2') {
        navigationPlane.classList.add('close-level-2');
      }
    } else {
      parentElement.classList.remove('is-active');
      dropdown.classList.add('u-hide');
    }
  }

  lastDropdown = dropdown;
}

function closeAllDropdowns(toggles, exceptions) {
  toggles.forEach(function (toggle) {
    if (exceptions) {
      // if the dropdown is in one of the exceptions, skip it
      if (!exceptions[toggle.parentNode.id] && !toggle.parentNode.classList.contains('p-navigation__item--dropdown-close')) {
        toggleDropdown(toggle, false, true);
      }
    } else {
      toggleDropdown(toggle, false, true);
    }
  });
}

function handleClickOutside() {
  document.addEventListener('click', function (event) {
    const target = event.target;

    if (target.closest) {
      if (!target.closest('.p-navigation')) {
        closeSlidingMenu();
      }
    }
  });
}

function handleClickToggle(toggle, toggles, navigationPlane) {
  let shouldOpen;

  const navigationOverlay = document.querySelector('.p-navigation__nav-overlay');

  if (!toggle.parentNode.classList.contains('p-navigation__item--dropdown-close')) {
    const parents = {};

    // get all parents and exclude them from being closed when a new dropdown is opened
    let parentToggle = toggle.parentNode.parentNode.closest('.p-navigation__item--dropdown-toggle');

    while (parentToggle) {
      parents[parentToggle.id] = parentToggle;

      parentToggle = parentToggle.parentNode.closest('.p-navigation__item--dropdown-toggle');
    }

    shouldOpen = !toggle.parentNode.classList.contains('is-active');

    // close all dropdowns except the ones that are parents of the clicked toggle
    closeAllDropdowns(toggles, parents);
  } else {
    shouldOpen = false; // close the dropdown when clicking on the back button
  }

  const dropdown = document.getElementById(toggle.getAttribute('aria-controls'));

  const dropdownLevel = dropdown.getAttribute('data-level');

  // show dropdown when opening it (places it in the tab order)
  dropdown.classList.remove('u-hide');
  navigationOverlay.classList.remove('u-hide');

  if (shouldOpen) {
    // set the width of the navigation plane based on dropdown level
    if (dropdownLevel === '1') {
      navigationPlane.classList.add('u-200-vw');
    } else if (dropdownLevel === '2') {
      navigationPlane.classList.remove('u-200-vw');
      navigationPlane.classList.add('u-300-vw');
    }
  }

  toggleDropdown(toggle, shouldOpen);
}

function toggleMenu(menuButton, navigation, toggles) {
  const navigationPlane = document.querySelector('.p-navigation__plane');

  navigationPlane.classList.remove('is-level-1-active', 'is-level-2-active', 'u-200-vw', 'u-300-vw');

  if (navigation.classList.contains('has-menu-open')) {
    menuButton.textContent = 'Menu';
    menuButton.removeAttribute('aria-pressed');
    navigation.classList.remove('has-menu-open');
  } else {
    if (typeof closeSearch === 'function') {
      closeSearch();
    }

    menuButton.textContent = 'Close menu';
    menuButton.setAttribute('aria-pressed', 'true');
    navigation.classList.add('has-menu-open');
    navigation.classList.remove('has-search-open');

    let buttons = navigation.querySelectorAll('.js-search-button');

    buttons.forEach((searchButton) => {
      searchButton.removeAttribute('aria-pressed');
    });
  }

  closeAllDropdowns(toggles);
}

// throttle util (for window resize event)
var throttle = function (fn, delay) {
  var timer = null;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
};

function closeSlidingMenu() {
  const navigation = document.querySelector('.p-navigation');
  const menuButton = navigation.querySelector('.js-menu-button');
  const toggles = [].slice.call(navigation.querySelectorAll(toggleClasses.map((className) => className + ' [aria-controls]').join(', ')));
  const navigationPlane = document.querySelector('.p-navigation__plane');

  navigationPlane.classList.remove('is-level-1-active', 'is-level-2-active', 'u-200-vw', 'u-300-vw');

  menuButton.textContent = 'Menu';
  menuButton.removeAttribute('aria-pressed');
  navigation.classList.remove('has-menu-open');

  closeAllDropdowns(toggles);
}

function initNavDropdowns() {
  const navigation = document.querySelector('.p-navigation');
  const navigationPlane = document.querySelector('.p-navigation__plane');
  const dropdowns = [].slice.call(navigation.querySelectorAll('.p-navigation__dropdown, .p-navigation__dropdown--right'));
  const toggles = [].slice.call(navigation.querySelectorAll(toggleClasses.map((className) => className + ' [aria-controls]').join(', ')));

  const menuButton = navigation.querySelector('.js-menu-button');

  if (menuButton) {
    menuButton.addEventListener('click', function (e) {
      e.preventDefault();

      toggleMenu(menuButton, navigation, toggles);
    });
  }

  handleClickOutside();

  navigationPlane.addEventListener('animationend', function (e) {
    e.stopPropagation();

    const navigationOverlay = document.querySelector('.p-navigation__nav-overlay');

    navigationPlane.classList.remove('open-level-1', 'open-level-2', 'close-level-1', 'close-level-2');

    navigationOverlay.classList.remove('p-fade-in-overlay', 'p-fade-out-overlay');
    navigationOverlay.classList.add('u-hide');

    if (lastDropdown) {
      const dropdownLevel = lastDropdown.getAttribute('data-level');

      // hide inactive dropdown when animation has finished (takes them out of the tab order)
      if (wasClosed) {
        lastDropdown.parentNode.classList.remove('is-active');
        lastDropdown.classList.add('u-hide');

        // reset navigation plane width and position based on dropdown level
        if (dropdownLevel === '1') {
          // reset completely
          navigationPlane.classList.remove('is-level-1-active', 'is-level-2-active', 'u-200-vw', 'u-300-vw');
        } else if (dropdownLevel === '2') {
          //reset to level 1
          navigationPlane.classList.remove('is-level-2-active', 'u-300-vw');
          navigationPlane.classList.add('is-level-1-active', 'u-200-vw');
        }

        // focus toggle button
        const toggleButton = lastDropdown.parentNode.querySelector('.p-navigation__link');

        // focus on parent toggle button after closing a dropdown
        // also helps scroll to the right position when the dropdown is longer than the viewport
        if (toggleButton) {
          toggleButton.focus();
        }
      } else {
        // set navigation plane width and position based on dropdown level
        if (dropdownLevel === '1') {
          navigationPlane.classList.add('is-level-1-active');
        } else if (dropdownLevel === '2') {
          navigationPlane.classList.remove('is-level-1-active');
          navigationPlane.classList.add('is-level-2-active');
        }
        // focus on back button after opening a dropdown
        // also helps scroll to the right position when the dropdown is longer than the viewport
        const backButton = lastDropdown.querySelector('.p-navigation__item--dropdown-close > .p-navigation__link');

        if (backButton) {
          backButton.focus();
        }
      }
    }
  });

  dropdowns.forEach(function (dropdown) {
    // hide inactive dropdowns (takes them out of the tab order)
    if (!dropdown.parentNode.classList.contains('is-active')) {
      dropdown.classList.add('u-hide');
    }
  });

  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', async function (e) {
      e.preventDefault();

      handleClickToggle(toggle, toggles, navigationPlane);
    });
  });

  // remove expanded/collapsed class names to avoid unexpected animations
  window.addEventListener(
    'resize',
    throttle(function () {
      navigationPlane.classList.remove('is-level-1-active', 'is-level-2-active', 'u-200-vw', 'u-300-vw');

      dropdowns.forEach((dropdown) => {
        dropdown.setAttribute('aria-expanded', false);

        dropdown.parentNode.classList.remove('is-active');
        dropdown.classList.add('u-hide');
      });
    }, 10)
  );
}
