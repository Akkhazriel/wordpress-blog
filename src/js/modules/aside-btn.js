const asideBtnToggle = document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.sidebar-btn')
  const navMenu = document.querySelector('.sidebar')

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active')
    navMenu.classList.toggle('active')
  })
})

export default asideBtnToggle