export const saveScrollPosition = () => {
  localStorage.setItem(
    'scrollPositionOnHome',
    JSON.stringify([window.scrollX, window.scrollY]),
  );
};

export const restoreScroll = () => {
  const savedScrollPositionString = localStorage.getItem(
    'scrollPositionOnHome',
  );
  if (savedScrollPositionString) {
    const savedScrollPosition = JSON.parse(savedScrollPositionString);
    const [scrollLeft, scrollTop] = savedScrollPosition;
    setTimeout(() => {
      window.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: 'auto',
      });
    }, 90);
  }
  localStorage.removeItem('scrollPositionOnHome');
};
export const handleSaveScrollPos = () => {
  localStorage.setItem(
    'scrollPositionOnHome',
    JSON.stringify([window.scrollX, window.scrollY]),
  );
};
