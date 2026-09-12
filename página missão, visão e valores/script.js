const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector(".nav-links");
const navigation = document.querySelector(".nav");
const progressBar = document.querySelector(
  ".page-progress span"
);

/* ABRIR E FECHAR O MENU NO CELULAR */

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const isOpen =
      menuButton.getAttribute("aria-expanded") === "true";

    menuButton.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );

    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Abrir menu" : "Fechar menu"
    );

    menu.classList.toggle("is-open", !isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      menuButton.setAttribute(
        "aria-label",
        "Abrir menu"
      );

      menu.classList.remove("is-open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      menuButton.setAttribute(
        "aria-label",
        "Abrir menu"
      );

      menu.classList.remove("is-open");
    }
  });
}

/* EFEITOS DE ROLAGEM */

const updateScrollEffects = () => {
  const scrollTop = window.scrollY;

  const scrollableHeight =
    document.documentElement.scrollHeight -
    window.innerHeight;

  const progress =
    scrollableHeight > 0
      ? (scrollTop / scrollableHeight) * 100
      : 0;

  if (navigation) {
    navigation.classList.toggle(
      "is-scrolled",
      scrollTop > 24
    );
  }

  if (progressBar) {
    progressBar.style.width =
      `${Math.min(progress, 100)}%`;
  }
};

updateScrollEffects();

window.addEventListener(
  "scroll",
  updateScrollEffects,
  { passive: true }
);

/* ANIMAÇÃO DE ENTRADA DOS ELEMENTOS */

const reveals =
  document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(
            "is-visible"
          );

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  reveals.forEach((element) => {
    observer.observe(element);
  });
} else {
  reveals.forEach((element) => {
    element.classList.add("is-visible");
  });
}

/* DESTACAR A SEÇÃO ATUAL NO MENU */

const sections = document.querySelectorAll(
  "#missao, #visao, #valores"
);

const navigationLinks =
  document.querySelectorAll(".nav-links a");

if (
  "IntersectionObserver" in window &&
  sections.length
) {
  const sectionObserver =
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          navigationLinks.forEach((link) => {
            const currentSection =
              link.getAttribute("href") ===
              `#${entry.target.id}`;

            link.classList.toggle(
              "is-active",
              currentSection
            );
          });
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px"
      }
    );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

/* ANO AUTOMÁTICO NO RODAPÉ */

const year = document.querySelector("#year");

if (year) {
  year.textContent =
    new Date().getFullYear();
}