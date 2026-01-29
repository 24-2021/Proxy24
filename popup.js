document.addEventListener('DOMContentLoaded', function() {
  const proxyList = document.getElementById('proxy-list');
  const addProxyButton = document.getElementById('add-proxy');
  
  // 输入框元素
  const proxyNameInput = document.getElementById('proxy-name');
  const proxyIconInput = document.getElementById('proxy-icon');
  const proxyTypeInput = document.getElementById('proxy-type');
  const proxyHostInput = document.getElementById('proxy-host');
  const proxyPortInput = document.getElementById('proxy-port');
  const proxyUsernameInput = document.getElementById('proxy-username');
  const proxyPasswordInput = document.getElementById('proxy-password');
  
  // 图标选择器逻辑
  const iconOptions = document.querySelectorAll('.icon-option');
  if (iconOptions.length > 0) {
    iconOptions.forEach(option => {
      option.addEventListener('click', function() {
        // 移除其他选中状态
        iconOptions.forEach(opt => opt.classList.remove('selected'));
        // 添加选中状态
        this.classList.add('selected');
        // 更新隐藏输入框的值
        if (proxyIconInput) {
          proxyIconInput.value = this.getAttribute('data-icon');
        }
      });
    });
  }

  // 白名单相关元素
  const whitelistItemsSelect = document.getElementById('whitelist-items');
  const removeWhitelistButton = document.getElementById('remove-whitelist');
  const batchWhitelistInput = document.getElementById('batch-whitelist');
  const clearWhitelistButton = document.getElementById('clear-whitelist');
  const batchAddWhitelistButton = document.getElementById('batch-add-whitelist');
  
  // 国际化资源
  const i18n = {
    zh: {
      tab_proxy: "代理设置",
      tab_add: "添加代理",
      tab_whitelist: "白名单",
      add_new_proxy: "添加新代理",
      label_name: "名称 (可选):",
      placeholder_name: "例如: 公司代理...",
      label_type: "类型:",
      label_host: "主机:",
      label_port: "端口:",
      label_username: "用户名:",
      label_password: "密码:",
      label_icon: "选择图标:",
      btn_add_proxy: "添加代理",
      whitelist_manager: "白名单管理",
      whitelist_help: "添加到白名单的域名将直接连接，不通过代理",
      placeholder_whitelist: "输入域名 (每行一个)",
      btn_add: "添加",
      msg_enter_host_port: "请输入代理主机和端口",
      msg_proxy_disabled: "已禁用代理",
      msg_proxy_enabled: "已启用代理",
      msg_proxy_enable_failed: "启用代理失败",
      msg_proxy_deleted: "代理已删除",
      msg_confirm_delete: "确定要删除这个代理吗？",
      msg_enter_domain: "请输入要添加的域名",
      msg_domains_added: "已添加 {n} 个域名",
      msg_select_domain: "请选择要移除的域名",
      msg_domain_removed: "域名已移除",
      msg_confirm_clear: "确定清空所有白名单吗？",
      msg_whitelist_cleared: "白名单已清空",
      proxy_disabled_name: "关闭代理",
      proxy_disabled_detail: "直接连接网络"
    },
    en: {
      tab_proxy: "Proxies",
      tab_add: "Add Proxy",
      tab_whitelist: "Whitelist",
      add_new_proxy: "Add New Proxy",
      label_name: "Name (Optional):",
      placeholder_name: "e.g. Company Proxy...",
      label_type: "Type:",
      label_host: "Host:",
      label_port: "Port:",
      label_username: "Username:",
      label_password: "Password:",
      label_icon: "Icon:",
      btn_add_proxy: "Add Proxy",
      whitelist_manager: "Whitelist Manager",
      whitelist_help: "Domains in whitelist will bypass the proxy.",
      placeholder_whitelist: "Enter domains (one per line)",
      btn_add: "Add",
      msg_enter_host_port: "Please enter host and port",
      msg_proxy_disabled: "Proxy Disabled",
      msg_proxy_enabled: "Proxy Enabled",
      msg_proxy_enable_failed: "Failed to enable proxy",
      msg_proxy_deleted: "Proxy Deleted",
      msg_confirm_delete: "Are you sure you want to delete this proxy?",
      msg_enter_domain: "Please enter domains to add",
      msg_domains_added: "Added {n} domains",
      msg_select_domain: "Please select a domain to remove",
      msg_domain_removed: "Domain removed",
      msg_confirm_clear: "Are you sure you want to clear the whitelist?",
      msg_whitelist_cleared: "Whitelist cleared",
      proxy_disabled_name: "Disable Proxy",
      proxy_disabled_detail: "Direct Connection"
    }
  };

  // 状态变量
  let currentLang = 'zh';
  let currentTheme = 'dark';

  // 初始化主题和语言
  chrome.storage.sync.get(['theme', 'lang'], function(data) {
    if (data.theme) {
      currentTheme = data.theme;
      applyTheme(currentTheme);
    }
    if (data.lang) {
      currentLang = data.lang;
      applyLanguage(currentLang);
    }
  });

  // 主题切换
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
      chrome.storage.sync.set({ theme: currentTheme });
    });
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      if (themeToggle) themeToggle.textContent = '☀️';
    } else {
      document.body.classList.remove('light-theme');
      if (themeToggle) themeToggle.textContent = '🌗';
    }
  }

  // 语言切换
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', function() {
      currentLang = currentLang === 'zh' ? 'en' : 'zh';
      applyLanguage(currentLang);
      chrome.storage.sync.set({ lang: currentLang });
      // 重新加载代理列表以更新文本
      loadProxies(); 
    });
  }

  function applyLanguage(lang) {
    const texts = i18n[lang];
    if (!texts) return;

    // 更新带有 data-i18n 的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (texts[key]) el.textContent = texts[key];
    });

    // 更新带有 data-i18n-placeholder 的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (texts[key]) el.placeholder = texts[key];
    });
    
    // 更新按钮文本
    if (langToggle) langToggle.textContent = lang === 'zh' ? 'EN' : '中';
  }

  // 辅助函数：获取翻译文本
  function t(key, params = {}) {
    let text = i18n[currentLang][key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
    return text;
  }

  
  // 选项卡切换功能
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      this.classList.add('active');
      const tabId = this.getAttribute('data-tab');
      const content = document.getElementById(`${tabId}-tab`);
      if (content) content.classList.add('active');
    });
  });

  // 初始化
  loadProxies();
  loadWhitelist();

  // ==================== 代理列表逻辑 ====================
  
  function loadProxies() {
    chrome.storage.sync.get(['proxies', 'currentProxy', 'isProxyEnabled'], function(data) {
      const proxies = data.proxies || [];
      const currentProxyIndex = data.currentProxy;
      const isProxyEnabled = data.isProxyEnabled;
      
      renderProxyList(proxies, isProxyEnabled, currentProxyIndex);
    });
  }
  
  function renderProxyList(proxies, isEnabled, currentIndex) {
    if (!proxyList) return;
    proxyList.innerHTML = '';
    
    // 1. Disable 选项
    const disableItem = document.createElement('div');
    disableItem.className = 'proxy-item';
    if (!isEnabled) disableItem.classList.add('active');
    
    disableItem.innerHTML = `
      <div class="proxy-icon-display" style="font-size: 24px;">🚫</div>
      <div class="proxy-info">
        <div class="proxy-name" style="color: #e74c3c;">${t('proxy_disabled_name')}</div>
        <div class="proxy-detail">${t('proxy_disabled_detail')}</div>
      </div>
    `;
    disableItem.addEventListener('click', () => disableProxy());
    proxyList.appendChild(disableItem);
    
    // 2. 代理列表
    proxies.forEach((proxy, index) => {
      const item = document.createElement('div');
      item.className = 'proxy-item';
      if (isEnabled && currentIndex === index) {
        item.classList.add('active');
      }
      
      const authBadge = (proxy.username && proxy.password) ? '🔒' : '';
      
      // 优先显示用户自定义的名称，如果没有则显示 Host:Port
      const displayName = proxy.name && proxy.name.trim() !== '' ? proxy.name : `${proxy.host}:${proxy.port}`;
      
      // 如果有自定义名称，则在详情里显示 Host:Port，否则显示类型
      const displayDetail = (proxy.name && proxy.name.trim() !== '')
        ? `${proxy.type.toUpperCase()} - ${proxy.host}:${proxy.port} ${authBadge}` 
        : `${proxy.type.toUpperCase()} ${authBadge}`;
        
      // 使用存储的图标，默认地球
      const proxyIcon = proxy.icon || '🌐'; 
      
      item.innerHTML = `
        <div class="proxy-icon-display">${proxyIcon}</div>
        <div class="proxy-info">
          <div class="proxy-name" style="color: #ecf0f1; font-weight: 600;">${displayName}</div>
          <div class="proxy-detail">${displayDetail}</div>
        </div>
        <button class="proxy-action-btn delete-btn" title="删除">🗑️</button>
      `;
      
      // 点击切换代理
      item.addEventListener('click', () => enableProxy(index, proxy));
      
      // 删除按钮
      const deleteBtn = item.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止冒泡
        if (confirm(t('msg_confirm_delete'))) {
          deleteProxy(index);
        }
      });
      
      proxyList.appendChild(item);
    });
  }
  
  function disableProxy() {
    chrome.storage.sync.set({ isProxyEnabled: false }, function() {
      chrome.runtime.sendMessage({
        action: 'toggleProxy',
        enable: false
      }, function(response) {
        loadProxies();
        showMessage(t('msg_proxy_disabled'), 'error');
      });
    });
  }
  
  function enableProxy(index, proxy) {
    chrome.storage.sync.set({
      isProxyEnabled: true,
      currentProxy: index
    }, function() {
      chrome.runtime.sendMessage({
        action: 'toggleProxy',
        enable: true,
        proxyConfig: proxy
      }, function(response) {
        if (response && response.success) {
          loadProxies();
          showMessage(t('msg_proxy_enabled'), 'success');
        } else {
          showMessage(t('msg_proxy_enable_failed'), 'error');
        }
      });
    });
  }
  
  function deleteProxy(index) {
    chrome.storage.sync.get(['proxies', 'currentProxy', 'isProxyEnabled'], function(data) {
      const proxies = data.proxies || [];
      const wasEnabled = data.isProxyEnabled;
      const wasCurrent = data.currentProxy === index;
      
      // 删除
      proxies.splice(index, 1);
      
      const updates = { proxies: proxies };
      
      // 如果删除的是当前正在使用的代理
      if (wasEnabled && wasCurrent) {
        updates.isProxyEnabled = false;
        // 禁用代理
        chrome.runtime.sendMessage({ action: 'toggleProxy', enable: false });
      }
      
      // 修正 currentProxy 索引
      if (data.currentProxy > index) {
        updates.currentProxy = data.currentProxy - 1;
      } else if (data.currentProxy === index) {
        updates.currentProxy = 0;
      }
      
      chrome.storage.sync.set(updates, function() {
        loadProxies();
        showMessage(t('msg_proxy_deleted'), 'success');
      });
    });
  }
  
  // ==================== 添加代理逻辑 ====================
  if (addProxyButton) {
    addProxyButton.addEventListener('click', function() {
      const name = proxyNameInput ? proxyNameInput.value.trim() : '';
      const icon = proxyIconInput ? proxyIconInput.value : '🌐';
      const type = proxyTypeInput.value;
      const host = proxyHostInput.value.trim();
      const port = proxyPortInput.value.trim();
      const username = proxyUsernameInput.value.trim();
      const password = proxyPasswordInput.value.trim();
      
      if (!host || !port) {
        showMessage(t('msg_enter_host_port'), 'error');
        return;
      }
      
      chrome.storage.sync.get(['proxies'], function(data) {
        const proxies = data.proxies || [];
        proxies.push({
          name: name, // 存储名字
          icon: icon, // 存储图标
          type: type,
          host: host,
          port: port,
          username: username,
          password: password
        });
        
        chrome.storage.sync.set({proxies: proxies}, function() {
          // 清空输入
          if (proxyNameInput) proxyNameInput.value = '';
          proxyHostInput.value = '';
          proxyPortInput.value = '';
          proxyUsernameInput.value = '';
          proxyPasswordInput.value = '';
          
          // 重置图标选择 (默认选择第一个)
          const firstIcon = document.querySelector('.icon-option');
          if (firstIcon) firstIcon.click();
          
          // 自动切换回列表页并选中新代理
          document.querySelector('.tab[data-tab="proxy"]').click();
          // 自动启用新代理
          enableProxy(proxies.length - 1, proxies[proxies.length - 1]);
        });
      });
    });
  }

  // ==================== 白名单逻辑 ====================
  
  function loadWhitelist() {
     if (!whitelistItemsSelect) return;
     
     chrome.runtime.sendMessage({ action: 'getWhitelist' }, function(response) {
       if (response && response.whitelist) {
         whitelistItemsSelect.innerHTML = '';
         response.whitelist.forEach(domain => {
           const option = document.createElement('option');
           option.value = domain;
           option.textContent = domain;
           whitelistItemsSelect.appendChild(option);
         });
       }
     });
  }
  
  if (batchAddWhitelistButton) {
    batchAddWhitelistButton.addEventListener('click', function() {
        const text = batchWhitelistInput.value;
        if (!text.trim()) {
            showMessage(t('msg_enter_domain'), 'warning');
            return;
        }
        
        const domains = text.split('\n').map(d => d.trim()).filter(d => d);
        if (domains.length === 0) return;
        
        chrome.runtime.sendMessage({ action: 'batchAddToWhitelist', domains: domains }, function(res) {
             if (res && res.success) {
                 batchWhitelistInput.value = '';
                 loadWhitelist();
                 showMessage(t('msg_domains_added', {n: domains.length}), 'success');
             }
        });
    });
  }
  
  if (removeWhitelistButton) {
    removeWhitelistButton.addEventListener('click', function() {
      if (!whitelistItemsSelect) return;
      const selectedIndex = whitelistItemsSelect.selectedIndex;
      if (selectedIndex === -1) {
        showMessage(t('msg_select_domain'), 'warning');
        return;
      }
      const domain = whitelistItemsSelect.options[selectedIndex].value;
      chrome.runtime.sendMessage({ action: 'removeFromWhitelist', domain: domain }, function(res) {
        if (res && res.success) {
          loadWhitelist();
          showMessage(t('msg_domain_removed'), 'success');
        }
      });
    });
  }
  
  if (clearWhitelistButton) {
    clearWhitelistButton.addEventListener('click', function() {
        if(confirm(t('msg_confirm_clear'))) {
            chrome.runtime.sendMessage({ action: 'clearWhitelist' }, function() {
                loadWhitelist();
                showMessage(t('msg_whitelist_cleared'), 'success');
            });
        }
    });
  }
  
  // 辅助函数：显示消息
  function showMessage(text, type) {
    const container = document.getElementById('message-container');
    if (!container) return;
    
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.textContent = text;
    
    container.appendChild(msg);
    
    setTimeout(() => {
      msg.style.opacity = '0';
      msg.style.transform = 'translateY(-20px)';
      setTimeout(() => container.removeChild(msg), 300);
    }, 2000);
  }
});
