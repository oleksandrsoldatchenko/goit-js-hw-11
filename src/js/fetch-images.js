// Імпорт бібліотеки axios
import axios from 'axios';
// Експорт аргументів функцій з зовнішні 
export { fetchImages, resetPages };

// Запис базового шляху отримання інформації, який буде доповнюватись ключами і номером сторінки
axios.defaults.baseURL = 'https://pixabay.com/api/';

let page = 1;

// Асінхронна функція яка повертає проміс data і дозволяє повторно повертатись до backend без необхідності перезавантажувати сторінку складаючи шлях після базового URL із переліку ключів та номера сторінки
async function fetchImages(searchText) {

    const optionParam = new URLSearchParams({
        //   Список параметрів рядка запиту, у тому числі в кожній відповіді приходять 40 об'єктів.
        key: '31758327-636c1b15bfc7bf596606469dc',
        q: searchText,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: page,
        per_page: 40,
    });
    
    const { data } = await axios.get(`?${optionParam}`);
    page += 1;
    return data;
};

// Функція яка повертає помер сторінки до 1 після повторного запиту у пошуковій формі
function resetPages() {
    page = 1;
};