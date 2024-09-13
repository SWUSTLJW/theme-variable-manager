let variablesData = {};
let editingVariableName = '';

// 获取变量数据并渲染表格
async function fetchVariables() {
  try {
    const response = await fetch('/variables');
    const data = await response.json();
    variablesData = data;
    renderTable(data);
  } catch (error) {
    console.error('Error fetching variables:', error);
  }
}

// 渲染表格
function renderTable(variables) {
  const tableBody = document.querySelector('#variable-table tbody');
  tableBody.innerHTML = ''; // 清空表格

  for (const [name, themes] of Object.entries(variables)) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <span class="variable-name" style="cursor: pointer;">${name}</span>
      </td>
      <td><input class="variable-value" data-theme="theme1" value="${themes.theme1 ? themes.theme1.value : ''}" /></td>
      <td><input class="variable-comment" data-theme="theme1" value="${themes.theme1 ? themes.theme1.comment : ''}" /></td>
      <td><input class="variable-value" data-theme="theme2" value="${themes.theme2 ? themes.theme2.value : ''}" /></td>
      <td><input class="variable-comment" data-theme="theme2" value="${themes.theme2 ? themes.theme2.comment : ''}" /></td>
      <td><input class="variable-value" data-theme="theme3" value="${themes.theme3 ? themes.theme3.value : ''}" /></td>
      <td><input class="variable-comment" data-theme="theme3" value="${themes.theme3 ? themes.theme3.comment : ''}" /></td>
      <td><button class="delete-button">Delete</button></td>
    `;
    tableBody.appendChild(row);
  }

  // 为每个变量名添加点击事件监听器
  document.querySelectorAll('.variable-name').forEach(variableName => {
    variableName.addEventListener('click', (event) => {
      editingVariableName = event.target.innerText.trim();
      document.getElementById('edit-variable-name').value = editingVariableName;

      const editModal = document.getElementById('edit-variable-modal');
      editModal.style.display = 'block';
    });
  });

  // 为每个删除按钮添加事件监听
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const row = event.target.closest('tr');
      const name = row.querySelector('.variable-name').innerText.trim();
      delete variablesData[name];
      renderTable(variablesData);
    });
  });
}

// 保存修改后的变量
document.getElementById('save-button').addEventListener('click', async () => {
  try {
    const updatedVariables = {};

    document.querySelectorAll('tbody tr').forEach(row => {
      const name = row.querySelector('.variable-name').innerText.trim();
      updatedVariables[name] = {};

      // 获取 theme1 的注释
      const theme1Comment = row.querySelector('input.variable-comment[data-theme="theme1"]').value.trim();

      ['theme1', 'theme2', 'theme3'].forEach(theme => {
        const valueInput = row.querySelector(`input.variable-value[data-theme="${theme}"]`);
        const commentInput = row.querySelector(`input.variable-comment[data-theme="${theme}"]`);

        if (valueInput && valueInput.value.trim() !== '') {
          // 如果当前主题有注释则保留，没有则使用 theme1 的注释
          const commentValue = commentInput.value.trim();
          updatedVariables[name][theme] = {
            value: valueInput.value,
            comment: commentValue || (theme !== 'theme1' ? theme1Comment : commentValue)  // 非 theme1 且注释为空时，复制 theme1 的注释
          };
        }
      });
    });

    const response = await fetch('/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedVariables)
    });

    const result = await response.json();
    alert(result.message);
  } catch (error) {
    console.error('Error saving variables:', error);
  }
});

// 添加新变量的功能
document.getElementById('add-variable-button').addEventListener('click', () => {
  const modal = document.getElementById('add-variable-modal');
  modal.style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
  const modal = document.getElementById('add-variable-modal');
  modal.style.display = 'none';
});

document.getElementById('confirm-add-variable').addEventListener('click', () => {
  const newVariableName = document.getElementById('new-variable-name').value.trim();
  
  if (newVariableName) {
    variablesData[newVariableName] = {
      theme1: { value: '', comment: '' },
      theme2: { value: '', comment: '' },
      theme3: { value: '', comment: '' }
    };
    
    renderTable(variablesData);
    
    // 关闭弹窗
    const modal = document.getElementById('add-variable-modal');
    modal.style.display = 'none';
  } else {
    alert('Variable name cannot be empty.');
  }
});

// 编辑变量名的功能
document.getElementById('confirm-edit-variable').addEventListener('click', () => {
  const newVariableName = document.getElementById('edit-variable-name').value.trim();
  
  if (newVariableName && editingVariableName) {
    const variableData = variablesData[editingVariableName];
    delete variablesData[editingVariableName];
    variablesData[newVariableName] = variableData;

    renderTable(variablesData);
    
    // 关闭弹窗
    const modal = document.getElementById('edit-variable-modal');
    modal.style.display = 'none';
  } else {
    alert('Variable name cannot be empty.');
  }
});

document.querySelector('.close-edit').addEventListener('click', () => {
  const modal = document.getElementById('edit-variable-modal');
  modal.style.display = 'none';
});

// 页面加载时获取变量数据
fetchVariables();

// 监听 Enter 键以确认添加变量
document.getElementById('new-variable-name').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // 防止表单默认提交
    document.getElementById('confirm-add-variable').click(); // 触发确认按钮点击事件
  }
});

// 监听 Enter 键以确认编辑变量
document.getElementById('edit-variable-name').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // 防止表单默认提交
    document.getElementById('confirm-edit-variable').click(); // 触发确认按钮点击事件
  }
});
