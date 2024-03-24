const menuBtnToggle = document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn')
  const navMenu = document.querySelector('.nav')
  const body = document.body

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active')
    navMenu.classList.toggle('active')
    body.classList.toggle('no-scroll')
  })
})

export default menuBtnToggle