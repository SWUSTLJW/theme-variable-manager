document.addEventListener("DOMContentLoaded", () => {
  const variableTableBody = document.querySelector("#variable-table tbody");
  const editVariableModal = document.getElementById("edit-variable-modal");
  const addVariableModal = document.getElementById("add-variable-modal");
  const addVariableForm = document.getElementById("add-variable-form");
  const addVariableNameInput = document.getElementById("add-variable-name");
  const addCommentInput = document.getElementById("add-comment");
  const editVariableNameInput = document.getElementById("edit-variable-name");
  const searchInput = document.getElementById("search-input");
  const saveButton = document.getElementById("save-variables");
  let currentEditVariableName = "";
  let fileNameList = null;
  let allVariables = {}; // 存储所有变量数据，使用对象形式

  // 加载变量
  function loadVariables() {
    fetch("/variables")
      .then((response) => response.json())
      .then((data) => {
        const { fileNameList: tempFileNameList, variables } = data;
        fileNameList = tempFileNameList;
        allVariables = variables; // 直接存储为对象
        sortAllVariables();
        renderTableHeader(); // 初始化表头
        renderVariables(Object.entries(allVariables)); // 初始化表格内容
      });
  }

  // 渲染表头
  function renderTableHeader() {
    const themeFiles = fileNameList;
    const thead = document.querySelector("#variable-table thead tr");

    // 清空表头
    thead.innerHTML = "";

    // 添加变量名称列的表头
    const nameTh = document.createElement("th");
    nameTh.textContent = "Variable Name";
    thead.appendChild(nameTh);

    // 添加 Comment 列的表头
    const commentTh = document.createElement("th");
    commentTh.textContent = "Comment";
    thead.appendChild(commentTh);

    // 添加主题列
    themeFiles.forEach((_, index) => {
      const th = document.createElement("th");
      th.textContent = `${fileNameList[index]}`;
      thead.appendChild(th);
    });

    // 添加删除列的表头
    const deleteTh = document.createElement("th");
    deleteTh.textContent = "Action";
    deleteTh.classList.add("action");
    thead.appendChild(deleteTh);
  }

  // 渲染变量
  function renderVariables(variables) {
    variableTableBody.innerHTML = "";

    variables.forEach(([name, data]) => {
      addVariableRow(name, data.comment, data.themes);
    });
    addInputListeners(); // 添加事件监听器
  }

  // 添加一行变量的函数
  function addVariableRow(name = "new-variable", comment = "", themes = []) {
    const newRow = document.createElement("tr");

    // 变量名称单元格
    const nameCell = document.createElement("td");
    nameCell.textContent = name;
    nameCell.classList.add("variable-name");
    nameCell.addEventListener("click", () => openEditModal(name));
    newRow.appendChild(nameCell);

    // Comment 单元格
    const commentCell = document.createElement("td");
    const commentInput = document.createElement("input");
    commentInput.type = "text";
    commentInput.value = comment;
    commentInput.classList.add("comment-input");
    commentInput.addEventListener("input", (e) => {
      commentCell.dataset.edited = true;
      commentCell.dataset.value = e.target.value;
      updateAllVariablesFromTable();
    });
    commentCell.appendChild(commentInput);
    newRow.appendChild(commentCell);

    // 动态生成主题列
    themes.forEach((themeValue) => {
      const themeCell = document.createElement("td");
      const themeInput = document.createElement("input");
      themeInput.type = "text";
      themeInput.value = themeValue;
      themeInput.classList.add("theme-input");
      themeInput.addEventListener("input", () => {
        themeCell.dataset.edited = true;
        updateAllVariablesFromTable();
      });
      themeCell.appendChild(themeInput);
      newRow.appendChild(themeCell);
    });

    // 删除按钮单元格
    const actionCell = document.createElement("td");
    actionCell.classList.add("action");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteVariable(newRow));
    actionCell.appendChild(deleteButton);
    newRow.appendChild(actionCell);

    variableTableBody.appendChild(newRow);
  }

  // 打开编辑模态框
  function openEditModal(variableName) {
    currentEditVariableName = variableName;
    editVariableNameInput.value = variableName;
    editVariableModal.style.display = "block";
  }

  // 关闭模态框
  function closeModal(modal) {
    modal.style.display = "none";
  }

  // 添加变量
  function addVariable() {
    const variableName = addVariableNameInput.value.trim();
    const comment = addCommentInput.value.trim();

    // 获取每个主题输入框的值
    const themeValues = Array.from(
      document.querySelectorAll(".theme-value-input")
    ).map((input) => input.value.trim());

    if (variableName) {
      // 将新变量添加到 allVariables 对象
      allVariables[variableName] = { comment, themes: themeValues };

      // 排序 allVariables
      sortAllVariables();

      renderVariables(Object.entries(allVariables)); // 重新渲染变量
      clearSearchValue();
      closeModal(addVariableModal);
    }
  }

  // 更新变量
  function updateVariable() {
    const newName = editVariableNameInput.value.trim();
    if (newName && currentEditVariableName) {
      const oldData = allVariables[currentEditVariableName];
      delete allVariables[currentEditVariableName];
      allVariables[newName] = oldData;
      // 排序 allVariables
      sortAllVariables();
      renderVariables(Object.entries(allVariables));
      clearSearchValue();
      closeModal(editVariableModal);
    }
  }

  // 保存变量
  function saveVariables() {
    updateAllVariablesFromTable(); // 保存前更新全局变量
    // 排序 allVariables
    sortAllVariables();

    // 发送保存请求
    fetch("/save-variables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(allVariables),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Variables saved:", data);
        alert("Variables have been saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving variables:", error);
        alert("Failed to save variables. Please try again.");
      });
  }

  // 删除变量
  function deleteVariable(row) {
    const name = row.querySelector(".variable-name").textContent;
    delete allVariables[name];
    renderVariables(Object.entries(allVariables));
    clearSearchValue();
  }

  // 打开添加变量模态框并生成主题变量值输入框
  function openAddVariableModal() {
    addVariableNameInput.value = "";
    addCommentInput.value = "";

    // 获取主题文件数目，生成相应数量的输入框
    const themeValuesContainer = document.getElementById(
      "theme-values-container"
    );
    themeValuesContainer.innerHTML = ""; // 清空之前的输入框

    fileNameList.forEach((fileName, index) => {
      const themeLabel = document.createElement("label");
      themeLabel.textContent = `Value for ${fileName}:`;

      const themeInput = document.createElement("input");
      themeInput.type = "text";
      themeInput.classList.add("theme-value-input");
      themeInput.dataset.index = index; // 用于标识输入框的顺序

      themeValuesContainer.appendChild(themeLabel);
      themeValuesContainer.appendChild(themeInput);
    });

    addVariableModal.style.display = "block";
  }

  // 清空搜索框
  function clearSearchValue() {
    searchInput.value = "";
  }

  // 监听搜索输入框
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredVariables = Object.entries(allVariables).filter(([name]) =>
      name.toLowerCase().includes(searchTerm)
    );
    renderVariables(filteredVariables);
  });

  // 监听添加变量按钮
  document.getElementById("add-variable").addEventListener("click", () => {
    openAddVariableModal();
  });

  // 监听添加变量表单提交
  addVariableForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addVariable();
  });

  // 监听编辑变量模态框保存按钮
  document
    .getElementById("edit-variable-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      updateVariable();
    });

  // 监听保存按钮
  saveButton.addEventListener("click", () => {
    saveVariables();
  });

  // 监听关闭模态框按钮
  document.querySelectorAll(".close, .close-add-variable").forEach((button) => {
    button.addEventListener("click", (e) => {
      closeModal(e.target.closest(".modal"));
    });
  });

  // 监听表格输入框的变化，实时更新全局变量
  function updateAllVariablesFromTable() {
    // 遍历表格中的每一行
    variableTableBody.querySelectorAll("tr").forEach((row) => {
      const name = row.querySelector(".variable-name").textContent.trim();

      // 获取注释和主题值
      const commentInput = row.querySelector(".comment-input");
      const themeInputs = row.querySelectorAll(".theme-input");

      // 更新全局变量
      allVariables[name] = {
        comment: commentInput ? commentInput.value.trim() : "",
        themes: Array.from(themeInputs).map((input) => input.value.trim()),
      };
    });
  }

  // 为所有输入框添加事件监听器
  function addInputListeners() {
    variableTableBody
      .querySelectorAll(".comment-input, .theme-input")
      .forEach((input) => {
        input.addEventListener("input", updateAllVariablesFromTable);
      });
  }

  // 按变量名对 allVariables 对象进行排序
  function sortAllVariables() {
    allVariables = Object.fromEntries(
      Object.entries(allVariables).sort(([a], [b]) => a.localeCompare(b))
    );
  }

  // 初始化
  loadVariables();
});
