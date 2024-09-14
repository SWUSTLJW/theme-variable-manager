document.addEventListener('DOMContentLoaded', () => {
  const variableTableBody = document.querySelector('#variable-table tbody');
  const editVariableModal = document.getElementById('edit-variable-modal');
  const addVariableModal = document.getElementById('add-variable-modal');
  const addVariableForm = document.getElementById('add-variable-form');
  const addVariableNameInput = document.getElementById('add-variable-name');
  const addCommentInput = document.getElementById('add-comment');
  const editVariableNameInput = document.getElementById('edit-variable-name');
  let currentEditVariableName = '';
  let fileNameList = null;

  // 加载变量
  function loadVariables() {
    fetch('/variables')
      .then(response => response.json())
      .then(data => {
        const {fileNameList: tempFileNameList, variables} = data;
        fileNameList = tempFileNameList;
        variableTableBody.innerHTML = '';
        const themeFiles = Object.keys(variables[Object.keys(variables)[0]].themes);
        
        // 动态生成表头
        const thead = document.querySelector('#variable-table thead tr');
        while (thead.children.length > 2) {
          thead.removeChild(thead.lastChild);
        }

        // 添加主题列和删除列的表头
        themeFiles.forEach((_, index) => {
          const th = document.createElement('th');
          th.textContent = `${tempFileNameList[index]}`;
          thead.appendChild(th);
        });

        // 添加 Comment 列列表头
        const commentTh = document.createElement('th');
        commentTh.textContent = 'Comment';
        thead.insertBefore(commentTh, thead.children[thead.children.length]);

        // 添加删除列的表头
        const deleteTh = document.createElement('th');
        deleteTh.textContent = 'Action';
        deleteTh.classList.add('action');
        thead.appendChild(deleteTh);

        Object.entries(variables).forEach(([name, data]) => {
          addVariableRow(name, data.comment, data.themes);
        });
      });
  }

  // 添加一行变量的函数
  function addVariableRow(name = 'new-variable', comment = '', themes = []) {
    const newRow = document.createElement('tr');

    // 变量名称单元格
    const nameCell = document.createElement('td');
    nameCell.textContent = name;
    nameCell.classList.add('variable-name');
    nameCell.addEventListener('click', () => {
      currentEditVariableName = name;
      editVariableNameInput.value = name;
      editVariableModal.style.display = 'block';
    });
    newRow.appendChild(nameCell);

    // 主题列
    const themeFilesCount = document.querySelectorAll('#variable-table thead th').length - 3;
    for (let i = 0; i < themeFilesCount; i++) {
      const themeCell = document.createElement('td');
      const themeInput = document.createElement('input');
      themeInput.value = themes[i] || ''; // 填充主题值或空白
      themeCell.appendChild(themeInput);
      newRow.appendChild(themeCell);
    }

    // 备注单元格
    const commentCell = document.createElement('td');
    const commentInput = document.createElement('input');
    commentInput.value = comment;
    commentCell.classList.add('variable-comment');
    commentCell.appendChild(commentInput);
    newRow.appendChild(commentCell);

    // 删除按钮单元格
    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      newRow.remove();
    });
    deleteCell.classList.add('action');
    deleteCell.appendChild(deleteButton);
    newRow.appendChild(deleteCell);

    // 将新行添加到表格中
    variableTableBody.appendChild(newRow);
  }

  // 保存变量
  function saveVariables() {
    const variables = {};

    document.querySelectorAll('#variable-table tbody tr').forEach(row => {
      const name = row.querySelector('.variable-name').textContent;
      const comment = row.querySelector('.variable-comment input').value;
      const themes = [...row.querySelectorAll('td input')].slice(0, -1).map(input => input.value);

      variables[name] = { comment, themes };
    });

    fetch('/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variables),
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
      })
      .catch(error => {
        console.error('Error saving variables:', error);
      });
  }

  // 打开“添加变量”模态框
  document.getElementById('add-variable').addEventListener('click', () => {
    addVariableModal.style.display = 'block';
    generateThemeFields(addVariableForm)
  });

  // 动态生成主题输入字段
  function generateThemeFields(modalForm, variableData = {}) {
    const formGroup = modalForm.querySelector('.theme-fields'); // 使用类名找到目标位置
    formGroup.innerHTML = ''; // 清空现有的内容
    fileNameList.forEach((theme, index) => {
      // 创建一个输入框
      const inputGroup = document.createElement('div');
      inputGroup.className = 'form-group';

      const label = document.createElement('label');
      label.textContent = `${theme} Value:`; // 动态设置标签
      label.setAttribute('for', `theme-${index}`);

      const input = document.createElement('input');
      input.autocomplete = 'off';
      input.type = 'text';
      input.id = theme;
      input.placeholder = `Enter value for ${theme}`;
      input.className = 'theme-input';

      // 如果是编辑模式，预填充值
      if (variableData.themes && variableData.themes[index]) {
        input.value = variableData.themes[index];
      }

      inputGroup.appendChild(label);
      inputGroup.appendChild(input);
      formGroup.appendChild(inputGroup);
    });
  }

  // 关闭“添加变量”模态框
  document.querySelector('.close-add-variable').addEventListener('click', () => {
    addVariableModal.style.display = 'none';
  });

  // 确认添加变量
  addVariableForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newName = addVariableNameInput.value.trim();
    const newComment = addCommentInput.value; // 注释字段设为可选项
    const themes = [];

    document.querySelectorAll('.theme-input').forEach(input => {
      themes.push(input.value);
    });

    if (!newName) {
      alert('Variable name is required');
      return;
    }

    addVariableRow(newName, newComment, themes);
    addVariableModal.style.display = 'none';
    addVariableNameInput.value = '';
    addCommentInput.value = ''; // 重置 Comment 字段
  });

  editVariableModal.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      document.getElementById('confirm-edit-variable').click();
    }
  });

  // 保存按钮点击事件
  document.getElementById('save-variables').addEventListener('click', saveVariables);

  // 保存修改的变量名
  document.getElementById('confirm-edit-variable').addEventListener('click', () => {
    event.preventDefault();
    const updatedName = editVariableNameInput.value;

    document.querySelectorAll('#variable-table tbody .variable-name').forEach(nameCell => {
      if (nameCell.textContent === currentEditVariableName) {
        nameCell.textContent = updatedName;
      }
    });

    editVariableModal.style.display = 'none';
  });

  // 关闭编辑模态框
  document.querySelector('.close').addEventListener('click', () => {
    editVariableModal.style.display = 'none';
  });

  // 加载变量
  loadVariables();
});
