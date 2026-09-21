/* ==========================================================
   КАТАЛОГ ОБЪЕКТОВ — функция-конструктор + прототип
   ========================================================== */

/* ---------- Функция-конструктор Item с валидацией ---------- */
function Item(name, price, category, rating = 0, year = 0) {
  if (!name || typeof name !== "string") {
    throw new Error("Item: поле 'name' обязательно и должно быть строкой");
  }
  if (typeof price !== "number" || price <= 0 || Number.isNaN(price)) {
    throw new Error("Item: поле 'price' должно быть положительным числом");
  }
  if (!category || typeof category !== "string") {
    throw new Error("Item: поле 'category' обязательно и должно быть строкой");
  }
  if (typeof rating !== "number" || rating < 0 || rating > 5) {
    throw new Error("Item: поле 'rating' должно быть числом от 0 до 5");
  }

  this.id = Item._nextId++;
  this.name = name;
  this.price = price;
  this.category = category;
  this.rating = rating;
  this.year = year;
  this.createdAt = new Date();
}

/* Счётчик id (статическое поле на функции-конструкторе) */
Item._nextId = 1;

/* Сброс счётчика (на случай повторного запуска) */
Item.resetId = function () {
  Item._nextId = 1;
};

/* ---------- Методы в прототипе ---------- */

/* Полное название с ценой */
Item.prototype.getInfo = function () {
  return `${this.name} — ${this.price} ₽ [${this.category}]`;
};

/* Текст с рейтингом */
Item.prototype.getRatingText = function () {
  return `⭐ ${this.rating} / 5`;
};

/* Применение скидки (возвращает НОВЫЙ объект, не мутирует) */
Item.prototype.withDiscount = function (percent) {
  if (typeof percent !== "number" || percent < 0 || percent > 100) {
    throw new Error("withDiscount: percent должен быть числом 0..100");
  }
  const discounted = this.clone();
  discounted.price = +(this.price * (1 - percent / 100)).toFixed(2);
  return discounted;
};

/* Проверка "дорогой ли товар" */
Item.prototype.isExpensive = function (threshold = 1000) {
  return this.price > threshold;
};

/* Клонирование — создаёт НОВЫЙ экземпляр с теми же данными */
Item.prototype.clone = function () {
  const copy = new Item(this.name, this.price, this.category, this.rating, this.year);
  // сохраняем исходный id и дату создания (клон = снимок оригинала)
  copy.id = this.id;
  copy.createdAt = new Date(this.createdAt);
  return copy;
};

/* Строковое представление */
Item.prototype.toString = function () {
  return `Item#${this.id} "${this.name}" (${this.price} ₽)`;
};


/* ==========================================================
   КАТАЛОГ — управление массивом экземпляров Item
   ========================================================== */

function Catalog() {
  this.items = [];
}

/* Добавить элемент (принимает Item) */
Catalog.prototype.add = function (item) {
  if (!(item instanceof Item)) {
    throw new Error("Catalog.add: ожидается экземпляр Item");
  }
  this.items.push(item);
  return item;
};

/* Удалить по id */
Catalog.prototype.remove = function (id) {
  const idx = this.items.findIndex(i => i.id === id);
  if (idx === -1) return false;
  this.items.splice(idx, 1);
  return true;
};

/* Обновить поля по id */
Catalog.prototype.update = function (id, changes) {
  const item = this.items.find(i => i.id === id);
  if (!item) return null;
  Object.keys(changes).forEach(key => {
    if (key === "id") return;
    item[key] = changes[key];
  });
  return item;
};

/* Найти по id */
Catalog.prototype.findItem = function (id) {
  return this.items.find(i => i.id === id) || null;
};

/* Найти по произвольному полю */
Catalog.prototype.findByField = function (field, value) {
  return this.items.filter(i => i[field] === value);
};

/* Статистика */
Catalog.prototype.getStats = function () {
  if (this.items.length === 0) {
    return { count: 0, avgPrice: 0, avgRating: 0, totalPrice: 0 };
  }
  const totalPrice = this.items.reduce((s, i) => s + i.price, 0);
  const totalRating = this.items.reduce((s, i) => s + i.rating, 0);
  return {
    count: this.items.length,
    totalPrice,
    avgPrice: +(totalPrice / this.items.length).toFixed(2),
    avgRating: +(totalRating / this.items.length).toFixed(2)
  };
};

/* Универсальная сортировка */
Catalog.prototype.sortBy = function (field, order = "asc") {
  const dir = order === "asc" ? 1 : -1;
  return this.items.slice().sort((a, b) => {
    if (a[field] < b[field]) return -1 * dir;
    if (a[field] > b[field]) return 1 * dir;
    return 0;
  });
};

/* Клонирование всего каталога */
Catalog.prototype.clone = function () {
  const copy = new Catalog();
  copy.items = this.items.map(i => i.clone());
  return copy;
};


/* ==========================================================
   ДЕМОНСТРАЦИЯ
   ========================================================== */

/* ---------- 1) Создаём каталог и наполняем товарами ---------- */

const catalog = new Catalog();

catalog.add(new Item("Мастер и Маргарита",       900,  "books",       4.9, 1967));
catalog.add(new Item("Преступление и наказание", 850,  "books",       4.8, 1866));
catalog.add(new Item("1984",                     700,  "books",       4.7, 1949));
catalog.add(new Item("Война и мир",              1500, "books",       4.6, 1869));
catalog.add(new Item("Телефон",                  25000, "electronics", 4.5, 2023));
catalog.add(new Item("Ноутбук",                  75000, "electronics", 4.8, 2024));
catalog.add(new Item("Наушники",                 3500,  "electronics", 4.4, 2023));
catalog.add(new Item("Монитор",                  18000, "electronics", 4.6, 2022));

/* ---------- 2) Методы прототипа ---------- */

console.log(catalog.items[0].getInfo());         // "Мастер и Маргарита — 900 ₽ [books]"
console.log(catalog.items[5].getRatingText());   // "⭐ 4.8 / 5"
console.log(catalog.items[5].isExpensive());     // true
console.log(catalog.items[0].isExpensive());     // false
console.log(String(catalog.items[0]));           // Item#1 "Мастер и Маргарита" (900 ₽)

/* ---------- 3) Клонирование элемента ---------- */

const original = catalog.items[5];              // Ноутбук
const copy = original.clone();

console.log("Оригинал:", original.toString());
console.log("Клон:    ", copy.toString());
console.log("Один и тот же объект?", original === copy);           // false
console.log("Тот же id?",            original.id === copy.id);     // true

copy.price = 60000;
console.log("Оригинал после изменения клона:", original.price);    // 75000 — не изменился
console.log("Клон после изменения:",          copy.price);         // 60000

/* ---------- 4) withDiscount возвращает НОВЫЙ объект ---------- */

const discounted = original.withDiscount(10);
console.log("Оригинал:", original.price);   // 75000
console.log("Со скидкой:", discounted.price); // 67500
console.log("Разные объекты?", original !== discounted); // true

/* ---------- 5) Валидация — ловим ошибки ---------- */

try { new Item("", 100, "books"); }          catch (e) { console.log("Ошибка 1:", e.message); }
try { new Item("X", -5, "books"); }          catch (e) { console.log("Ошибка 2:", e.message); }
try { new Item("X", 100, ""); }              catch (e) { console.log("Ошибка 3:", e.message); }
try { new Item("X", 100, "books", 10); }     catch (e) { console.log("Ошибка 4:", e.message); }

/* ---------- 6) Статистика и сортировка ---------- */

console.log(catalog.getStats());
// { count: 8, totalPrice: ..., avgPrice: ..., avgRating: ... }

console.log(
  catalog.sortBy("price", "desc").map(i => `${i.name} — ${i.price}`)
);
// ["Ноутбук — 75000", "Телефон — 25000", ...]

/* ---------- 7) Клонирование всего каталога ---------- */

const catalogCopy = catalog.clone();
catalogCopy.items[0].price = 100;

console.log("Оригинал [0].price:", catalog.items[0].price);      // 900
console.log("Копия    [0].price:", catalogCopy.items[0].price);  // 100
console.log("Массивы разные?", catalog.items !== catalogCopy.items); // true