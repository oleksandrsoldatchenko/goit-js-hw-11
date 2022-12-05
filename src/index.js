// Імпорт бібліотек notiflix і simplelightbox
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// Імпорт функцій fetchImages і resetPages з стороннього файлу js
import { fetchImages, resetPages } from './js/fetch-images';

// Запис констант форми і стилів з HTML файлу
const form = document.querySelector('.search-form');
const galleryAll = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');
const btnUp = document.querySelector('.btn-up');
const loadEnd = document.querySelector('.load-end');

// Запис слухача на кнопку submit форми
form.addEventListener('submit', formSubmit);

// Запис параметів lightbox - alt і затримки відображення заголовка
const lightbox = new SimpleLightbox('.gallery a', {
    captions: false,
});

// Запис слухачів на кнопки завантаження додаткових заних і переміщення на початок сторінки
btnLoadMore.addEventListener('click', onClickLoadMoreBtn);
btnUp.addEventListener('click', onClickToUpBtn);

// Запис змінних початкового стану, пустий рядок пошуку, первинне завантаження однієї сторінки з 40 карточками
let searchText = '';
const perPage = 40;
let totalPages = 0;

// Головна функція, асінхронна, що включає в себе параметри початкового стану до введеня даних в форму і обробку результату введеня даних, звернення до функцій виведення оповіщень, кількості виведених результатів і скролу сторінки
async function formSubmit(event) {
    // Заборона перезавантаження сторінки
    event.preventDefault();
    // Початковий стан відображення сторінки - без карток
    clearCardsContainer();
    // Початковий стан номера стоінки - функція resetPages з імпортованого файлу
    resetPages();
    // Початковий стан кнопки btnLoadMore - схований
    btnLoadMore.classList.add('is-hidden');
    // Початковий стан контейнеру btnloadEndUp - схований
    loadEnd.classList.add('is-hidden');
    // Початковий стан кнопки btnUp - схований
    btnUp.style.display = 'none';
    // Видалення зайвих пробілів або символів на початку на кінці введеного в форму тексту
    searchText = event.currentTarget.searchQuery.value.trim();
    // Запис константи, яка призупиняє виконання асінхронної функції доки не буде виконано функцію fetchImages з імпотованого файлу
    const { totalHits, hits } = await fetchImages(searchText);
    // Скидання даних з форми
    event.target.reset();

    // Перевірка умови і в разі відсутності збігу - виклик функції alertNoImagesFound
    if (hits.length === 0) {
        alertNoImagesFound();
    } else {
        // В разі наявного збігу пошуку по бекенду, спрацьовую виклик оповіщення з розрахунком кількості знайдених результатів
        alertYesImagesFound(totalHits);
        totalPages = Math.ceil(totalHits / perPage);
    }

    // Умова - за результатом розрахунку, якщо результат пошуку більший за 40 (perPage) знімається клас s-hidden з кнопки завантаження додаткових результатів. Кнопка відоражається
    if (totalHits > perPage) {
        btnLoadMore.classList.remove('is-hidden');
    }

    // Відстежування скролу по сторінці і в разі наівності виклик функції onWindowScroll яка відображає кнопку btnUp
    window.addEventListener('scroll', onWindowScroll);
    // Звернення до функції, що доповнює сторінку додатково завантаженими зображень
    renderCards(hits);
    // Оновлення звернення до бібліотеки lightbox
    lightbox.refresh();
}

// Функція, що записує у галерею розмітку картки з необхідними для оформлення стилями і властивостями завантаженого зображення
function createCards(cards) {
  return cards
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
            <a class="gallery__link" href="${largeImageURL}">
                <div class="gallery-item">
                    <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
                    <div class="info">
                        <p class="info-item">
                            <b>Likes </b>${likes}
                        </p>
                        <p class="info-item">
                            <b>Views </b>${views}
                        </p>
                        <p class="info-item">
                            <b>Comments </b>${comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads </b>${downloads}
                        </p>
                    </div>
                </div>
            </a>
        `
    )
    .join('');
}

// Фнкція, що додає картки в галерею
function renderCards(cards) {
    galleryAll.insertAdjacentHTML('beforeend', createCards(cards));
}

// Функція, що стирає попередньо завантажені дані галереї перед повторним завантаженням іншого запиту
function clearCardsContainer() {
    galleryAll.innerHTML = '';
}

// Асинхронна фунція що звертається до деструктурованих даних імпотованої вкладеної функції fetchImages, перевіряє номер завантаженої сторінки, змінює стан кнопки btnLoadMore та оновлює звернення до бібліотеки lightbox
async function onClickLoadMoreBtn() {
    totalPages -= 1;
    const { hits } = await fetchImages(searchText);
    renderCards(hits);

    if (totalPages === 1) {
        btnLoadMore.classList.add('is-hidden');
        alertLoadEnd();
    }

    lightbox.refresh();
}

// Функція яка при кліку на кнопку Up повертає користувача на верх сторінки та ховає кнопку Up
function onClickToUpBtn() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    btnUp.style.display = 'none';
}

// Функція що змінює стан кнопки btnUp після зміщення від початкового екрану
function onWindowScroll() {
    const scrolled = window.pageYOffset;
    const coords = document.documentElement.clientHeight;

    if (scrolled > coords) {
        btnUp.style.display = 'block';
    }

    if (scrolled < coords) {
        btnUp.style.display = 'none';
    }
}

// Функція, що в разі відсутності результату пошуку виводить оповіщення про помилку за допомогою бібліотеки notiflix
function alertNoImagesFound() {
    Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
    );
}

// Функція, що в разі наявності результату пошуку виводить оповіщення за допомогою бібліотеки notiflix
function alertYesImagesFound(hits) {
    Notiflix.Notify.success(`Hooray! We found ${hits} images.`);
}

// Функція у разі досягнення закінчення досупного для завантаження масиву даних забирає клас is-hidden з контейнеру з відповідним текстом у розмітці
function alertLoadEnd() {
    loadEnd.classList.remove('is-hidden');
}