const DOM = () => {
  const outputContainer = document.querySelector("#code");
  const colorsContainer = document.querySelector(".colors");
  const directionsContainer = document.querySelector(".buttons");
  const limitOfColors = 6;
  const colors = [];
  const state = {
    observers: [],
  };

  let currentDirection = "to bottom";
  let currentGradient = "linear";

  const subscribe = (observerFunction) => {
    state.observers.push(observerFunction);
  };

  const notifyAll = (command) => {
    console.log(`Notifying from dom ${state.observers.length} observer`);

    for (const observerFunction of state.observers) {
      observerFunction(command);
    }
  };

  const updateHTML = (code, outputCode) => {
    const preview = document.querySelector(".preview");
    if (preview) preview.style.background = code;

    outputContainer.value = outputCode;
    document.body.style.background = code;
  };

  const setActiveDirection = (button) => {
    const directions = document.querySelectorAll(".buttons button");

    for (let button of directions) button.classList.remove("active");
    button.classList.add("active");
  };

  const setActiveGradient = (gradient) => {
    let gradients = document.querySelectorAll(".right div");

    for (let gradient of gradients) gradient.classList.remove("active");
    gradient.classList.add("active");
  };

  const copyCode = () => {
    outputContainer.select();
    document.execCommand("copy");

    const command = {
      text: "Código copiado!",
    };
    notifyAll(command);
  };

  const addColor = () => {
    if (colors.length == limitOfColors - 1) {
      notifyAll({ text: "Limite atingido!" });
      document.querySelector("#addColor").remove();
    }

    let colorHTML = `
      <div class="close" onclick="dom.removeColor(colorId)">
        <i class="fas fa-plus"></i>
      </div>
      <input
        type="color"
        value="${randomColor()}"
        oninput="dom.generateCode()"
      />
      <div class="range">
        <div class="sliderValue" color-id="colorId">
          <span>100</span>
        </div>
        <div class="field">
          <input
            type="range"
            min="1"
            max="99"
            value="30"
            step="1"
            color-id="colorId"
            oninput="dom.moveMarker(colorId)"
            onblur="dom.removeMarker(colorId)"
            onchange="dom.generateCode()"
          />
        </div>
      </div>
    `;

    const colorsInputs = document.querySelectorAll(".colors .color");

    let id;
    if (colorsInputs.length == 0) id = 0;
    else
      id =
        Number(colorsInputs[colorsInputs.length - 1].getAttribute("color-id")) +
        1;

    const color = document.createElement("div");
    color.setAttribute("color-id", id);
    color.classList.add("color");
    color.innerHTML = colorHTML.replace(/colorId/g, id);

    colorsContainer.appendChild(color);

    const inputColor = document.querySelectorAll(".color input[type='color']");
    const inputRange = document.querySelectorAll(".color input[type='range']");
    colors.push({
      color: inputColor[inputColor.length - 1],
      percent: inputRange[inputColor.length - 1],
    });

    if (colors.length == limitOfColors) return;
    updateButtonAddColor();

    generateCode();
  };

  const removeColor = (id) => {
    if (colors.length <= 2) {
      notifyAll({ text: "É necessario ter no minimo 2 cores" });
      return;
    }

    const element = document.querySelector(`.color[color-id="${id}"]`);
    if (element) {
      element.remove();
      colors.splice(id, 1);
    }

    generateCode();
    updateButtonAddColor();
  };

  const updateButtonAddColor = () => {
    const buttonHTML = '<i class="fas fa-plus"></i>';
    const button = document.createElement("button");
    button.setAttribute("id", "addColor");
    button.innerHTML = buttonHTML;
    button.onclick = addColor;

    if (document.querySelector("#addColor"))
      document.querySelector("#addColor").remove();
    colorsContainer.appendChild(button);
  };

  const randomColor = () => {
    const numbers = "0123456789ABCDEF";
    let color = "#";

    for (let i = 0; i < 6; i++) {
      const randomNumber = Math.floor(Math.random() * numbers.length);
      color += numbers[randomNumber];
    }

    return color;
  };

  const generateCode = () => {
    if (colors.length <= 1) return;

    let expression = "";
    colors.forEach(
      (data) => (expression += `, ${data.color.value} ${data.percent.value}%`)
    );

    let code;
    if (currentGradient === "linear")
      code = `${currentGradient}-gradient(${currentDirection}${expression})`;
    else {
      code = `${currentGradient}-gradient(${expression})`;
      code = code.replace(", ", "");
    }

    let outputCode = getCssCodePrefixes(code);
    outputCode = outputCode.replace(/--/g, "background: ");
    outputCode = outputCode.replace(/\)/g, ");");

    updateHTML(code, outputCode);
  };

  function getCssCodePrefixes(code) {
    let codePrefixed = `--${code}\n`;
    const prefixes = ["-o-", "-ms-", "-moz-", "-webkit-"];

    prefixes.forEach((prefixe) => (codePrefixed += `--${prefixe}${code}\n`));
    return codePrefixed;
  }

  const setDirection = (value, _this) => {
    setActiveDirection(_this);
    currentDirection = value;
    generateCode();
  };

  const setGradient = (value, _this) => {
    setActiveGradient(_this);
    currentGradient = value;
    generateCode();

    if (value === "linear") removeDirectionButtons(true);
    else removeDirectionButtons();
  };

  const moveMarker = (id) => {
    const sliderValue = document.querySelector(
      `div.sliderValue[color-id="${id}"] span`
    );
    const inputSlider = document.querySelector(
      `.field input[color-id="${id}"]`
    );

    let value = inputSlider.value;
    sliderValue.textContent = value;
    sliderValue.style.left = `calc(${value}% + 7.5px)`;
    sliderValue.classList.add("show");

    dom.generateCode();
  };

  const removeMarker = (id) => {
    const sliderValue = document.querySelector(
      `div.sliderValue[color-id="${id}"] span`
    );
    const inputSlider = document.querySelector(
      `.field input[color-id="${id}"]`
    );
    sliderValue.classList.remove("show");
  };

  const alternateContainer = () => {
    const container = document.querySelector(".container");
    container.classList.toggle("containerHidden");
  };

  const removeDirectionButtons = (show = false) => {
    if (!show) directionsContainer.classList.add("containerHidden");
    else directionsContainer.classList.remove("containerHidden");
  };

  const removePreview = () => {
    const preview = document.querySelector(".preview");
    if (preview) preview.remove();
  };

  const addPreview = () => {
    const preview = document.createElement("div");
    preview.classList.add("preview");
    document.body.appendChild(preview);
    generateCode();
  };

  return {
    removePreview,
    addPreview,
    updateHTML,
    setActiveDirection,
    setGradient,
    copyCode,
    addColor,
    removeColor,
    subscribe,
    setDirection,
    generateCode,
    moveMarker,
    removeMarker,
    alternateContainer,
  };
};

const Theme = () => {
  const checkbox = document.querySelector("input[name=theme]");

  const setTheme = (input) => {
    if (input.checked) document.body.setAttribute("data-theme", "dark");
    else document.body.setAttribute("data-theme", "light");
  };

  const transition = () => {
    document.body.classList.add("transition");
    window.setTimeout(() => {
      document.body.classList.remove("transition");
    }, 1000);
  };

  const changeCheckbox = (event) => {
    setTheme(event.target);
    transition();
  };

  return {
    checkbox,
    changeCheckbox,
  };
};

const Toasted = () => {
  const toastedHtml = `
    <div class="content">text</div>
    <div class="loading"></div>
  `;

  const create = (command) => {
    if (!command) return;
    const toasted = document.createElement("div");

    toasted.classList.add("toasted");
    toasted.innerHTML = toastedHtml.replace("text", command.text);

    document.body.appendChild(toasted);
    setTimeout(() => {
      document.body.querySelector(".toasted").remove();
    }, 5100);
  };

  const deleteAll = () => {
    if (document.querySelectorAll(".toasted")) {
      const toasteds = document.querySelectorAll(".toasted");
      toasteds.forEach((toasted) => toasted.remove());
    }
  };

  return {
    create,
    deleteAll,
  };
};

const dom = DOM();
const toasted = Toasted();
const theme = Theme();

dom.subscribe(toasted.create);

dom.addColor();
dom.addColor();

theme.checkbox.addEventListener("change", theme.changeCheckbox);

window.addEventListener("resize", () => {
  if (window.innerWidth <= 1080) dom.removePreview();
  else {
    if (!document.querySelector(".preview")) dom.addPreview();
  }
});
