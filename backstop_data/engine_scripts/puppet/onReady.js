module.exports = async (page, scenario, vp) => {
  console.log('SCENARIO > ' + scenario.label);
  await require('./clickAndHoverHelper')(page, scenario);

  // add more ready handlers here...
  await page.addStyleTag({
    content: `
      ::-webkit-scrollbar {
        display: none;
      }
      body {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
        background: #000 !important;
        background-image: none !important;
      }
      #background-video {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
    `
  });
};
