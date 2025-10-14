const puppeteer = require('puppeteer');
const { KnownDevices } = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 这个脚本将直接启动Chrome浏览器并保留登录状态

(async () => {
  try {
    log('所有可用设备:' + Object.keys(KnownDevices).join(', '));
    
    log('\n==== 启动说明 ====');
    log('程序将直接启动Chrome浏览器并使用您的用户数据');
    log('请确保没有其他Chrome实例正在运行...');
    log('==================\n');
    
    log('\n==== 增强评论互动模式说明 ====');
    log('💬 评论互动：自动点赞评论内容');
    log('   - 快捷键：X 打开/关闭评论面板');
    log('   - 自动点击 .xZhLomAs 元素（点赞评论）');
    log('   - 3-5分钟持续评论点赞操作');
    log('   - 动态元素获取：实时获取新评论');
    log('   - 防重复机制：避免重复点赞同一评论');
    log('   - 滚动加载：自动滚动加载更多评论');
    log('   - 实时进度：显示剩余时间和处理统计');
    log('⏩ 视频切换：多策略切换');
    log('   - 快捷键：下箭头, 右箭头, PageDown, J');
    log('   - 鼠标滚轮滚动');
    log('   - 元素点击回退方案');
    log('   - 最多2次重试机制');
    log('⏱️ 观看时间：6-12秒随机观看时间');
    log('🔄 循环模式：无限循环处理视频');
    log('📊 统计信息：实时显示处理统计');
    log('⚡ 错误处理：全局异常捕获，确保脚本持续运行');
    log('===========================\n');
    
    log('程序启动，开始记录日志...');
    
    // 定义Chrome用户数据目录路径 - 使用相对路径到项目中的用户数据
    const userDataDir = './chrome-user-data';

    log('正在启动Chrome，参数配置：');
    log('- 用户数据目录:', userDataDir);
    log('- 可执行文件路径: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
1
    // 启动Chrome浏览器，直接使用用户的数据目录
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      userDataDir: userDataDir,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: [
        '--auto-open-devtools-for-tabs',
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // 移除可能导致渲染问题的参数
        '--disable-web-security',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ]
    });
    
    log('已成功启动Chrome浏览器，保留所有登录状态');
    
    // 创建一个新页面
    const page = await browser.newPage();

    // 设置视口
    await page.setViewport({
      width: 900,
      height: 800,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false
    });

    // 添加页面错误监听
    page.on('response', response => {
      if (response.status() >= 400) {
        log(`页面响应错误: ${response.status()} ${response.url()}`);
      }
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {   
        log('页面控制台错误:', msg.text());
      }
    });

    // 尝试打开抖音网站，添加重试机制
    let retryCount = 0;
    const maxRetries = 3;
    let pageLoaded = false;

    while (!pageLoaded && retryCount < maxRetries) {
      try {
        retryCount++; 
        log(`正在打开抖音网站（尝试 ${retryCount}/${maxRetries}）...`);

        // 先等待页面基本加载
        await page.goto('https://www.douyin.com/?recommend=1', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });

        // 等待页面关键元素加载
        await page.waitForSelector('body', { timeout: 10000 });
        log('页面DOM加载完成');

        // 额外等待以确保内容加载
        await new Promise(resolve => setTimeout(resolve, 5000));

        pageLoaded = true;
        log('页面加载完成，可以进行交互');
      } catch (pageError) {
        log(`尝试 ${retryCount} 加载页面失败: ${pageError.message}`);
        if (retryCount >= maxRetries) {
          log('已达到最大重试次数，无法加载页面');
          throw pageError;
        }
        log('等待3秒后重试...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 增强的点赞操作 - 多种策略组合
    async function likeVideo(page, maxRetries = 3) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          log(`开始执行点赞操作（尝试 ${attempt}/${maxRetries}）...`);
          
          // 检查页面是否仍然有效
          if (page.isClosed()) {
            throw new Error('页面已关闭');
          }
          
          // 策略1: 确保页面聚焦
          await page.bringToFront();
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 策略2: 模拟鼠标移动到视频区域（触发控件显示）
          try {
            await page.mouse.move(400, 300); // 移动到视频中心区域
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (mouseError) {
            log(`鼠标移动失败: ${mouseError.message}`);
          }
          
          // 策略3: 尝试多种键盘快捷键组合
          const likeShortcuts = ['', '', ' ', ''];
          let shortcutSuccess = false;
          
          for (const shortcut of likeShortcuts) {
            try {
              log(`尝试点赞`);
              await page.keyboard.press(shortcut);
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              // 检查是否有视觉反馈（点赞动画或状态变化）
              // 这里可以添加检测逻辑
              shortcutSuccess = true;
              log(`点赞执行成功`);
              break;
            } catch (shortcutError) {
              log(`点赞失败失败: ${shortcutError.message}`);
              continue;
            }
          }
          
          if (shortcutSuccess) {
            return true;
          }
          
          // 策略4: 回退到元素点击（备用方案）
          log('键盘快捷键无效，尝试元素点击...');
          const likeSelectors = [
            '.UIQajZAR',
            '[data-e2e="video-like"]',
            '.video-like-btn',
            'button[aria-label*="点赞"]',
            'button[title*="点赞"]',
            '.like-button',
            '.xgplayer-like',
            '.like-icon'
          ];
          
          for (const selector of likeSelectors) {
            try {
              await page.waitForSelector(selector, { timeout: 2000 });
              await page.click(selector);
              log(`使用选择器 ${selector} 点击成功`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return true;
            } catch (elementError) {
              continue;
            }
          }
          
          if (attempt < maxRetries) {
            log(`第 ${attempt} 次尝试失败，等待2秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
        } catch (error) {
          log(`点赞操作失败 (尝试 ${attempt}): ${error.message}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      log('所有点赞策略均失败');
      return false;
    }

    // 生成元素唯一标识符的辅助函数
    function generateElementFingerprint(elementInfo) {
      // 组合多个属性创建唯一标识符
      const position = `${elementInfo.boundingRect.top}_${elementInfo.boundingRect.left}`;
      const content = elementInfo.commentText || elementInfo.userInfo || '';
      const classSignature = elementInfo.className ? elementInfo.className.split(' ').sort().join('_') : 'no_class';
      
      // 添加尺寸信息增强唯一性
      const size = `${elementInfo.boundingRect.width}x${elementInfo.boundingRect.height}`;
      
      // 添加内容长度信息
      const contentLength = content.length;
      
      // 相对位置信息
      const relativePosition = elementInfo.elementIndex >= 0 ? `idx${elementInfo.elementIndex}` : 'no_idx';
      const parentSignature = elementInfo.parentClass ? elementInfo.parentClass.replace(/\s+/g, '_').substring(0, 20) : 'no_parent';
      const grandParentSignature = elementInfo.grandParentClass ? elementInfo.grandParentClass.replace(/\s+/g, '_').substring(0, 15) : 'no_gp';
      const greatGrandParentSignature = elementInfo.greatGrandParentClass ? elementInfo.greatGrandParentClass.replace(/\s+/g, '_').substring(0, 10) : 'no_ggp';
      
      // 标签名信息（用于更精确的结构识别）
      const parentTag = elementInfo.parentTagName || 'no_ptag';
      const grandParentTag = elementInfo.grandParentTagName || 'no_gptag';
      
      // 添加内容哈希值（增强内容识别）
      const contentHash = content.length > 0 ? hashCode(content.substring(0, 50)) : 'no_hash';
      
      // 创建更详细的指纹（包含位置、尺寸、内容、类名、相对位置、父容器信息、内容哈希、标签名）
      const fingerprint = `${position}_${size}_${contentLength}_${contentHash}_${classSignature}_${relativePosition}_${parentSignature}_${grandParentSignature}_${greatGrandParentSignature}_${parentTag}_${grandParentTag}`;
      
      // 移除特殊字符，确保标识符的稳定性
      return fingerprint.replace(/[^\w\-_]/g, '_');
    }
    
    // 计算两个字符串的相似度（使用编辑距离算法）
    function calculateSimilarity(str1, str2) {
      if (!str1 || !str2) return 0;
      
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;
      
      if (longer.length === 0) return 1.0;
      
      const editDistance = levenshteinDistance(longer, shorter);
      return (longer.length - editDistance) / longer.length;
    }
    
    // 计算编辑距离
    function levenshteinDistance(str1, str2) {
      const matrix = [];
      
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // 替换
              matrix[i][j - 1] + 1,     // 插入
              matrix[i - 1][j] + 1      // 删除
            );
          }
        }
      }
      
      return matrix[str2.length][str1.length];
    }
    
    // 分析指纹冲突情况
    function analyzeFingerprintConflicts() {
      const fingerprints = new Set();
      const conflicts = new Map();
      let similarityChecks = 0;
      
      // 分析时间窗口缓存中的指纹
      for (const [fingerprint, data] of processedElementsWithTime) {
        fingerprints.add(fingerprint);
        
        // 检查是否有相似的指纹（基于位置和内容）
        const fingerprintParts = fingerprint.split('_');
        if (fingerprintParts.length >= 4) {
          const position = fingerprintParts[0] + '_' + fingerprintParts[1];
          const size = fingerprintParts[2];
          const contentHash = fingerprintParts[3];
          
          const key = `${position}_${size}`;
          if (!conflicts.has(key)) {
            conflicts.set(key, []);
          }
          conflicts.get(key).push({ fingerprint, contentHash, data });
        }
      }
      
      // 统计潜在冲突
      let potentialConflicts = 0;
      for (const [key, entries] of conflicts) {
        if (entries.length > 1) {
          // 检查内容哈希是否不同但位置相同
          const contentHashes = new Set(entries.map(e => e.contentHash));
          if (contentHashes.size > 1) {
            potentialConflicts++;
            log(`发现潜在指纹冲突: 位置 ${key} 有 ${entries.length} 个不同内容的元素`);
          }
        }
      }
      
      // 统计内容相似度检查次数
      similarityChecks = sessionTimeWindowSkips; // 内容相似检测次数
      
      return {
        totalFingerprints: fingerprints.size,
        potentialConflicts,
        similarityChecks
      };
    }
    
    // 简单的哈希函数（用于内容识别）
    function hashCode(str) {
      let hash = 0;
      if (str.length === 0) return hash;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
      }
      return Math.abs(hash).toString(36); // 转换为36进制字符串
    }

    // 增强的评论互动功能 - 3-5分钟持续操作（解决重复点击问题）
    async function interactWithComments(page, maxRetries = 1) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          log(`开始增强评论互动流程（尝试 ${attempt}/${maxRetries}）...`);
          
          // 检查页面是否仍然有效
          if (page.isClosed()) {
            throw new Error('页面已关闭');
          }
          
          // 确保页面聚焦
          await page.bringToFront();
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 步骤1: 按下 x键 打开评论面板
          log('步骤1: 按下 x键 打开评论面板...');
          await page.keyboard.press('x');
          
          // 步骤2: 等待评论面板加载
          const loadWaitTime = Math.random() * 1000 + 1500; // 1.5-2.5秒随机等待
          log(`步骤2: 等待 ${(loadWaitTime / 1000).toFixed(1)} 秒让评论面板加载...`);
          await new Promise(resolve => setTimeout(resolve, loadWaitTime));
          
          // 设置总运行时间（3-5分钟随机）
          const totalDuration = Math.random() * 80000 + 130000; // 3-5分钟（180000-300000毫秒）
          const startTime = Date.now();
          const endTime = startTime + totalDuration;
          
          // 用于记录已处理的元素唯一标识，避免重复点击
              const processedElements = new Set();
              let totalProcessed = 0;
              let scrollCount = 0;
              let duplicateCount = 0; // 记录重复元素数量
              
              // 元素缓存，避免重复获取相同元素（带时间戳）
              const elementCache = new Map();
              const processedElementsWithTime = new Map(); // 记录处理时间和次数
              
              // 会话统计信息
              const sessionStartTime = Date.now();
              let sessionElementsFound = 0;
              let sessionElementsProcessed = 0;
              let sessionDuplicatesSkipped = 0;
              let sessionTimeWindowSkips = 0; // 时间窗口内跳过的数量
          
          log(`步骤3: 开始持续评论点赞操作，总时长: ${(totalDuration / 60000).toFixed(1)}分钟`);
          
          // 持续循环直到时间结束
          while (Date.now() < endTime) {
            const remainingTime = endTime - Date.now();
            const remainingMinutes = (remainingTime / 60000).toFixed(1);
            
            try {
              // 等待元素出现（缩短超时时间以提高效率）
              await page.waitForSelector('.xZhLomAs', { timeout: 2000 });
              
              // 查找评论点赞按钮 - 使用多个备选选择器
            let elements = [];
            const selectors = [
                '.xZhLomAs',  // 主要选择器
                '[data-e2e="comment-like"]',  // 数据属性选择器
                '.comment-like',  // 类名选择器
                '[class*="like"][class*="comment"]',  // 模糊匹配
                'button[class*="like"]'  // 按钮选择器
            ];
            
            for (const selector of selectors) {
                try {
                    const foundElements = await page.$$(selector);
                    if (foundElements.length > 0) {
                        elements = foundElements;
                        log(`使用选择器 "${selector}" 找到 ${foundElements.length} 个元素`);
                        break;
                    }
                } catch (e) {
                    log(`选择器 "${selector}" 失败: ${e.message}`);
                }
            }
            
            if (elements.length === 0) {
                log('未找到任何评论点赞按钮，尝试通用选择器');
                try {
                    elements = await page.$$('.xZhLomAs');  // 回退到原始选择器
                } catch (e) {
                    log(`回退选择器也失败: ${e.message}`);
                }
            }
              log(`找到 ${elements.length} 个评论点赞按钮`);
              
              // 收集元素信息用于去重
                const elementsWithInfo = [];
                let currentDuplicates = 0;
                
                for (let i = 0; i < elements.length; i++) {
                  const element = elements[i];
                  
                  try {
                    log(`正在处理第 ${i + 1} 个元素...`);
                    
                    // 检查元素是否仍然存在于DOM中
                    const isConnected = await element.evaluate(el => el.isConnected);
                    if (!isConnected) {
                      log(`第 ${i + 1} 个元素已从DOM中移除，跳过`);
                      await element.dispose();
                      continue;
                    }
                    
                    // 获取元素位置信息
                    const boundingRect = await element.evaluate(el => {
                      const rect = el.getBoundingClientRect();
                      return {
                        top: Math.round(rect.top),
                        left: Math.round(rect.left),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                      };
                    });
                    
                    log(`第 ${i + 1} 个元素位置: ${boundingRect.top},${boundingRect.left}`);
                    
                    // 检查元素是否在可视区域内（避免点击不可见元素）
                    const windowSize = await page.evaluate(() => ({
                      width: window.innerWidth,
                      height: window.innerHeight
                    }));
                    
                    if (boundingRect.top < 0 || boundingRect.left < 0 || 
                        boundingRect.bottom > windowSize.height || 
                        boundingRect.right > windowSize.width ||
                        boundingRect.width === 0 || boundingRect.height === 0) {
                      log(`第 ${i + 1} 个元素不在可视区域内或尺寸为0，跳过`);
                      await element.dispose();
                      continue;
                    }
                    
                    // 获取元素在父容器中的索引位置（相对位置）
                    const elementIndexInfo = await element.evaluate(el => {
                      const parent = el.parentElement;
                      if (!parent) return { index: -1, parentClass: '', grandParentClass: '' };
                      
                      // 获取同类元素中的索引（基于类名相似度）
                      const elClassName = el.className || '';
                      const elClasses = elClassName.split(' ').filter(c => c.length > 0);
                      
                      const siblings = Array.from(parent.children).filter(child => {
                        if (!child.className) return false;
                        const childClasses = child.className.split(' ').filter(c => c.length > 0);
                        // 计算类名相似度（至少有一个相同类名）
                        return elClasses.some(elClass => childClasses.includes(elClass));
                      });
                      
                      const index = siblings.indexOf(el);
                      
                      // 获取祖先元素信息（用于更精确的相对定位）
                      const grandParent = parent.parentElement;
                      const greatGrandParent = grandParent?.parentElement;
                      
                      return {
                        index: index,
                        parentClass: parent.className || '',
                        grandParentClass: grandParent?.className || '',
                        greatGrandParentClass: greatGrandParent?.className || '',
                        parentTagName: parent.tagName || '',
                        grandParentTagName: grandParent?.tagName || ''
                      };
                    });
                    
                    log(`元素相对位置: 父容器类名="${elementIndexInfo.parentClass}", 索引=${elementIndexInfo.index}`);
                    
                    // 获取评论内容（用于辅助识别）
                    let commentText = '';
                    const commentElement = await element.evaluateHandle(el => 
                      el.closest('[data-e2e="comment-item"]') || 
                      el.closest('.comment-item') ||
                      el.parentElement?.parentElement?.parentElement
                    );
                    
                    if (commentElement) {
                      commentText = await commentElement.evaluate(el => {
                        const textSelectors = [
                          '.comment-text',
                          '.text',
                          '[data-e2e="comment-text"]',
                          'span',
                          'div'
                        ];
                        
                        for (const selector of textSelectors) {
                          const textElement = el.querySelector(selector);
                          if (textElement && textElement.textContent?.trim().length > 0) {
                            return textElement.textContent.trim().substring(0, 50);
                          }
                        }
                        
                        return el.textContent?.trim().substring(0, 50) || '';
                      });
                    }
                    
                    // 获取用户信息
                    let userInfo = '';
                    const userSelectors = [
                      '[data-e2e="comment-username"]',
                      '.username',
                      '.user-name',
                      'a[href*="/user/"]',
                      '.nickname'
                    ];
                    
                    for (const selector of userSelectors) {
                      const userElement = await commentElement?.$eval(selector, el => el.textContent?.trim() || el.href || '')
                        .catch(() => '');
                      if (userElement) {
                        userInfo = userElement;
                        break;
                      }
                    }
                    
                    // 生成元素指纹
                    let className = '';
                    try {
                      className = await element.evaluate(el => Array.from(el.classList).sort().join(' '));
                    } catch (classError) {
                      log(`获取元素类名失败: ${classError.message}`);
                      className = 'unknown_class';
                    }
                    
                    const elementKey = generateElementFingerprint({
                      boundingRect,
                      commentText,
                      userInfo,
                      className,
                      elementIndex: elementIndexInfo.index,
                      parentClass: elementIndexInfo.parentClass,
                      grandParentClass: elementIndexInfo.grandParentClass,
                      greatGrandParentClass: elementIndexInfo.greatGrandParentClass,
                      parentTagName: elementIndexInfo.parentTagName,
                      grandParentTagName: elementIndexInfo.grandParentTagName
                    });
                    
                    // 检查是否已在缓存中（双重检查 + 时间窗口验证 + 内容相似度检查）
                    const currentTime = Date.now();
                    const timeWindow = 5 * 60 * 1000; // 5分钟时间窗口
                    
                    // 检查是否在时间窗口内已经处理过
                    const lastProcessed = processedElementsWithTime.get(elementKey);
                    const isInTimeWindow = lastProcessed && (currentTime - lastProcessed.time < timeWindow);
                    const processCount = lastProcessed ? lastProcessed.count : 0;
                    
                    // 内容相似度检查（检测非常相似的评论）
                    let contentSimilar = false;
                    if (commentText && commentText.length > 10) {
                      for (const [existingKey, existingData] of processedElementsWithTime) {
                        if (existingData && existingData.lastContent) {
                          const similarity = calculateSimilarity(commentText, existingData.lastContent);
                          if (similarity > 0.8) { // 相似度超过80%认为是重复
                            contentSimilar = true;
                            log(`发现内容相似的评论（相似度: ${(similarity * 100).toFixed(1)}%），跳过`);
                            break;
                          }
                        }
                      }
                    }
                    
                    if (!elementCache.has(elementKey) && !processedElements.has(elementKey) && !isInTimeWindow && !contentSimilar) {
                      elementsWithInfo.push({
                        index: i,
                        elementKey,
                        boundingRect,
                        commentText,
                        userInfo
                      });
                      log(`元素处理完成，指纹: ${elementKey.substring(0, 20)}...`);
                    } else {
                      currentDuplicates++;
                      duplicateCount++;
                      if (isInTimeWindow) {
                        sessionTimeWindowSkips++;
                        log(`发现重复元素（时间窗口内，上次处理: ${((currentTime - lastProcessed.time) / 1000).toFixed(1)}秒前，已处理${processCount}次），跳过`);
                      } else if (contentSimilar) {
                        sessionTimeWindowSkips++;
                        log(`发现内容相似的评论，跳过`);
                      } else {
                        log(`发现重复元素，跳过`);
                      }
                    }
                    
                    await commentElement?.dispose();
                    await element.dispose();
                  } catch (error) {
                    log(`获取第${i+1}个元素信息失败: ${error.message}`);
                    try {
                      await element.dispose();
                    } catch (disposeError) {
                      // 忽略清理错误
                    }
                    continue;
                  }
                }
                
                // 更新会话统计
                sessionElementsFound += elements.length;
                sessionElementsProcessed += elementsWithInfo.length;
                sessionDuplicatesSkipped += currentDuplicates;
                
                log(`过滤后剩余 ${elementsWithInfo.length} 个新元素（跳过 ${currentDuplicates} 个重复元素）`);
              
              log(`[剩余${remainingMinutes}分钟] 找到 ${elementsWithInfo.length} 个评论点赞元素`);
              
              if (elementsWithInfo.length > 0) {
                let newElementsFound = 0;
                let skippedElements = 0;
                
                // 逐个检查并处理元素
                for (let i = 0; i < elementsWithInfo.length; i++) {
                  try {
                    const elementInfo = elementsWithInfo[i];
                    
                    // 验证元素信息完整性
                    if (!elementInfo || !elementInfo.boundingRect) {
                      log(`元素信息不完整，跳过`);
                      continue;
                    }
                    
                    // 创建唯一标识符（组合多个属性）
                    const elementKey = generateElementFingerprint(elementInfo);
                    
                    // 检查是否已经处理过这个元素（同时检查两个缓存）
                    if (processedElements.has(elementKey) || elementCache.has(elementKey)) {
                      skippedElements++;
                      duplicateCount++;
                      log(`元素已在缓存中，跳过（指纹: ${elementKey.substring(0, 20)}...）`);
                      continue; // 跳过已处理的元素
                    }
                    
                    // 验证元素是否仍然有效（检查位置是否变化）
                     try {
                       const currentElements = await page.$$('.xZhLomAs');
                       log(`当前找到 ${currentElements.length} 个元素，尝试索引 ${elementInfo.index}`);
                       
                       if (elementInfo.index >= currentElements.length) {
                         log(`元素索引 ${elementInfo.index} 超出范围（总数：${currentElements.length}），跳过此元素`);
                         continue;
                       }
                       
                       // 检查元素位置是否发生变化（验证元素有效性）
                       let currentRect;
                       try {
                         currentRect = await currentElements[elementInfo.index].evaluate(el => {
                           const rect = el.getBoundingClientRect();
                           return {
                             top: Math.round(rect.top),
                             left: Math.round(rect.left),
                             width: Math.round(rect.width),
                             height: Math.round(rect.height)
                           };
                         });
                         log(`元素当前位置: ${currentRect.top},${currentRect.left}，原始位置: ${elementInfo.boundingRect.top},${elementInfo.boundingRect.left}`);
                       } catch (rectError) {
                         log(`获取元素位置失败: ${rectError.message}，跳过此元素`);
                         continue;
                       }
                       
                       // 检查尺寸是否一致（防止元素被替换）
                       if (currentRect.width !== elementInfo.boundingRect.width || 
                           currentRect.height !== elementInfo.boundingRect.height) {
                         log(`元素尺寸发生变化（原: ${elementInfo.boundingRect.width}x${elementInfo.boundingRect.height}，现: ${currentRect.width}x${currentRect.height}），可能已被替换，跳过此元素`);
                         continue;
                       }
                       
                       // 如果位置变化超过阈值，认为元素已失效
                       const positionThreshold = 100; // 增加到100像素阈值，考虑页面滚动
                       if (Math.abs(currentRect.top - elementInfo.boundingRect.top) > positionThreshold ||
                           Math.abs(currentRect.left - elementInfo.boundingRect.left) > positionThreshold) {
                         log(`元素位置发生显著变化（垂直差: ${Math.abs(currentRect.top - elementInfo.boundingRect.top)}，水平差: ${Math.abs(currentRect.left - elementInfo.boundingRect.left)}），可能已失效，跳过此元素`);
                         continue;
                       }
                       
                       // 点击新元素
                       log(`[剩余${remainingMinutes}分钟] 点击第 ${totalProcessed + 1} 个新评论点赞元素 (位置: ${elementInfo.boundingRect.top},${elementInfo.boundingRect.left})...`);
                       await currentElements[elementInfo.index].click();
                       
                       // 加入缓存（双重缓存确保不重复）
                      elementCache.set(elementInfo.elementKey, true);
                      processedElements.add(elementInfo.elementKey);
                      processedElementsWithTime.set(elementInfo.elementKey, {
                        time: Date.now(),
                        count: (processedElementsWithTime.get(elementInfo.elementKey)?.count || 0) + 1,
                        lastContent: elementInfo.commentText || '',
                        lastUser: elementInfo.userInfo || ''
                      });
                      log(`元素点击成功，已加入双重缓存（处理时间窗口验证）`);
                       
                     } catch (clickError) {
                       log(`点击元素失败: ${clickError.message}，尝试备用方案`);
                       try {
                         // 备用方案：使用JavaScript点击
                         await page.evaluate((index) => {
                           const elements = document.querySelectorAll('.xZhLomAs');
                           if (elements[index]) {
                             elements[index].click();
                           }
                         }, elementInfo.index);
                         elementCache.set(elementInfo.elementKey, true);
                         processedElements.add(elementInfo.elementKey);
                         processedElementsWithTime.set(elementInfo.elementKey, {
                           time: Date.now(),
                           count: (processedElementsWithTime.get(elementInfo.elementKey)?.count || 0) + 1
                         });
                         log(`备用方案点击成功，已加入双重缓存（处理时间窗口验证）`);
                       } catch (backupError) {
                         log(`备用点击方案也失败: ${backupError.message}，跳过此元素`);
                         continue;
                       }
                     }
                    
                    // 记录已处理
                    processedElements.add(elementKey);
                    totalProcessed++;
                    newElementsFound++;
                    
                    // 更新全局统计
                    stats.totalCommentsLiked++;
                    
                    // 每次点击后等待2-5秒的随机时间
                    const clickDelay = Math.random() * 3000 + 2000; // 2-5秒随机等待
                    log(`等待 ${(clickDelay / 1000).toFixed(1)} 秒后继续...`);
                    await new Promise(resolve => setTimeout(resolve, clickDelay));
                    
                    // 检查是否还需要继续（时间是否充足）
                    if (Date.now() >= endTime) {
                      log('时间到，停止处理当前元素');
                      break;
                    }
                    
                  } catch (clickError) {
                    log(`点击元素失败: ${clickError.message}`);
                    continue;
                  }
                }
                
                log(`[剩余${remainingMinutes}分钟] 本次循环处理了 ${newElementsFound} 个新元素，跳过 ${skippedElements} 个重复元素，累计处理 ${totalProcessed} 个`);
                
                // 如果没有找到新元素，尝试滚动加载更多
                if (newElementsFound === 0) {
                  scrollCount++;
                  log(`[剩余${remainingMinutes}分钟] 未找到新元素，尝试滚动加载更多评论（第${scrollCount}次）...`);
                  
                  try {
                    // 尝试滚动评论列表 - 多种策略
                    await page.evaluate(() => {
                      // 策略1: 尝试找到评论容器
                      const commentContainer = document.querySelector('.xZhLomAs')?.parentElement?.parentElement;
                      if (commentContainer) {
                        commentContainer.scrollTop += 400; // 向下滚动400像素
                        return 'container_scroll';
                      }
                      
                      // 策略2: 尝试找到通用的评论列表容器
                      const genericContainer = document.querySelector('[data-e2e="comment-list"]') ||
                                           document.querySelector('.comment-list') ||
                                           document.querySelector('.comments-container');
                      if (genericContainer) {
                        genericContainer.scrollTop += 400;
                        return 'generic_scroll';
                      }
                      
                      // 策略3: 页面整体滚动
                      window.scrollBy(0, 400);
                      return 'window_scroll';
                    });
                    
                    // 滚动后等待新内容加载
                    const scrollWaitTime = Math.random() * 2000 + 1500; // 1.5-3.5秒
                    log(`滚动后等待 ${(scrollWaitTime / 1000).toFixed(1)} 秒让新内容加载...`);
                    await new Promise(resolve => setTimeout(resolve, scrollWaitTime));
                    
                    // 等待元素稳定
                    try {
                      await page.waitForFunction(() => {
                        const elements = document.querySelectorAll('.xZhLomAs');
                        return Array.from(elements).every(el => {
                          const rect = el.getBoundingClientRect();
                          return rect.width > 0 && rect.height > 0 && el.isConnected;
                        });
                      }, { timeout: 2000 }).catch(() => {
                        log('元素稳定性检查超时，继续执行');
                      });
                    } catch (stabilityError) {
                      log(`元素稳定性检查失败: ${stabilityError.message}`);
                    }
                    
                    // 智能检测：等待新元素出现或超时
                    try {
                      await page.waitForFunction(
                        (previousCount) => {
                          const currentElements = document.querySelectorAll('.xZhLomAs');
                          return currentElements.length > previousCount;
                        },
                        { timeout: 3000 },
                        elementsWithInfo.length
                      );
                      log('检测到新评论元素加载成功');
                    } catch (waitError) {
                      log('未检测到新元素，继续处理现有元素');
                    }
                    
                  } catch (scrollError) {
                    log(`滚动失败: ${scrollError.message}`);
                  }
                }
                
              } else {
                log(`[剩余${remainingMinutes}分钟] 未找到评论点赞元素，尝试滚动加载...`);
                scrollCount++;
                
                try {
                  // 尝试滚动页面
                  await page.evaluate(() => window.scrollBy(0, 300));
                  
                  const scrollWaitTime = Math.random() * 2000 + 1500;
                  await new Promise(resolve => setTimeout(resolve, scrollWaitTime));
                  
                } catch (scrollError) {
                  log(`滚动失败: ${scrollError.message}`);
                }
              }
              
              // 短暂休息，避免过于频繁
              const restTime = Math.random() * 1000 + 500; // 0.5-1.5秒
              await new Promise(resolve => setTimeout(resolve, restTime));
              
            } catch (elementError) {
              log(`查找元素失败: ${elementError.message}`);
              
              // 如果找不到元素，尝试滚动
              try {
                await page.evaluate(() => window.scrollBy(0, 300));
                const waitTime = Math.random() * 2000 + 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
              } catch (scrollError) {
                log(`滚动失败: ${scrollError.message}`);
              }
            }
          }
          
          log(`步骤4: 评论点赞操作完成，总共处理了 ${totalProcessed} 个评论点赞元素，跳过 ${duplicateCount} 个重复元素`);
          
          // 会话详细统计
          const sessionDuration = ((Date.now() - sessionStartTime) / 1000).toFixed(1);
          const sessionDeduplicationRate = sessionElementsFound > 0 ? ((sessionDuplicatesSkipped / sessionElementsFound) * 100).toFixed(1) : 0;
          const avgProcessingTime = sessionElementsProcessed > 0 ? (sessionDuration / sessionElementsProcessed).toFixed(2) : 0;
          
          // 分析指纹冲突情况
          const fingerprintStats = analyzeFingerprintConflicts();
          
          log(`会话统计: 持续时间 ${sessionDuration}秒，发现元素 ${sessionElementsFound} 个，处理 ${sessionElementsProcessed} 个，跳过重复 ${sessionDuplicatesSkipped} 个（其中时间窗口内跳过 ${sessionTimeWindowSkips} 个）`);
          log(`去重率: ${sessionDeduplicationRate}%，平均处理时间: ${avgProcessingTime}秒/元素`);
          log(`指纹统计: 总指纹数 ${fingerprintStats.totalFingerprints}，潜在冲突 ${fingerprintStats.potentialConflicts}，内容相似检测 ${fingerprintStats.similarityChecks} 次`);
          log(`去重统计: 成功处理 ${totalProcessed} 个元素，跳过 ${duplicateCount} 个重复元素，总体去重率: ${duplicateCount > 0 ? ((duplicateCount / (totalProcessed + duplicateCount)) * 100).toFixed(1) : 0}%`);
          
          // 步骤5: 按下 x 键关闭评论面板
          log('步骤5: 按下 x 键关闭评论面板...');
          await page.keyboard.press('x');
          
          // 等待关闭完成
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          log(`增强评论互动流程完成，总处理时间: ${((Date.now() - startTime) / 60000).toFixed(1)}分钟`);
          return true;
          
        } catch (error) {
          log(`增强评论互动流程失败 (尝试 ${attempt}): ${error.message}`);
          
          // 尝试关闭评论面板
          try {
            await page.keyboard.press('x');
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (closeError) {
            log(`关闭评论面板失败: ${closeError.message}`);
          }
          
          if (attempt < maxRetries) {
            log(`等待3秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
          if (attempt < maxRetries) {
            log(`等待3秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
      
      log('所有增强评论互动策略均失败');
      return false;
    }

    
    // 增强的视频切换功能 - 多种策略组合
    async function nextVideo(page, maxRetries = 2) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          log(`开始执行切换视频操作（尝试 ${attempt}/${maxRetries})...`);
          
          // 检查页面是否仍然有效
          if (page.isClosed()) {
            throw new Error('页面已关闭');
          }
          
          // 确保页面聚焦
          await page.bringToFront();
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 策略1: 尝试多种键盘快捷键
          const nextShortcuts = ['ArrowDown', 'ArrowRight', 'PageDown', 'j', 'J'];
          let shortcutSuccess = false;
          
          for (const shortcut of nextShortcuts) {
            try {
              log(`尝试快捷键: ${shortcut}`);
              await page.keyboard.press(shortcut);
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // 检查是否成功切换（可以添加检测逻辑）
              shortcutSuccess = true;
              log(`快捷键 ${shortcut} 执行成功`);
              break;
            } catch (shortcutError) {
              log(`快捷键 ${shortcut} 失败: ${shortcutError.message}`);
              continue;
            }
          }
          
          if (shortcutSuccess) {
            return true;
          }
          
          // 策略2: 尝试鼠标滚轮滚动
          log('键盘快捷键无效，尝试鼠标滚轮...');
          try {
            await page.mouse.wheel({ deltaY: 800 }); // 向下滚动800像素
            log('鼠标滚轮滚动成功');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return true;
          } catch (wheelError) {
            log(`鼠标滚轮失败: ${wheelError.message}`);
          }
          
          // 策略3: 回退到元素点击
          log('尝试元素点击切换...');
          const nextSelectors = [
            '[data-e2e="video-switch"]',
            '.video-next-btn',
            '.next-video',
            'button[aria-label*="下一个"]',
            'button[title*="下一个"]',
            '.swiper-button-next',
            '.arrow-right',
            '.next-btn',
          ];
          
          for (const selector of nextSelectors) {
            try {
              await page.waitForSelector(selector, { timeout: 2000 });
              await page.click(selector);
              log(`使用选择器 ${selector} 点击成功`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              return true;
            } catch (elementError) {
              continue;
            }
          }
          
          if (attempt < maxRetries) {
            log(`第 ${attempt} 次尝试失败,等待3秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
        } catch (error) {
          log(`切换视频操作失败 (尝试 ${attempt}): ${error.message}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
      
      log('所有切换策略均失败');
      return false;
    }

    // 统计信息
    const stats = {
      total: 0,
      likeSuccess: 0,
      likeFailed: 0,
      likeSkipped: 0, // 跳过的点赞次数
      commentInteractSuccess: 0, // 评论互动成功次数
      commentInteractFailed: 0,  // 评论互动失败次数
      nextSuccess: 0,
      nextFailed: 0,
      totalCommentsLiked: 0, // 新增：总评论点赞数
      commentSessions: 0 // 新增：评论互动会话数
    };

    // 创建日志文件
    const logFile = path.join(__dirname, 'douyin_bot.log');
    
    // 简化的点赞决策函数（移除智能决策）
    function generateLikeDecision() {
      // 固定30%概率点赞，不再基于时间段
      const shouldLike = Math.random() < 0.3;
      
      return {
        shouldLike,
        probability: 0.3,
        reason: '随机决策',
        hour: new Date().getHours(),
        baseProbability: 0.3
      };
    }
    
    // 增强的日志函数
    function log(message) {
      const timestamp = new Date().toLocaleString();
      const logMessage = `[${timestamp}] ${message}`;
      console.log(logMessage);
      
      // 写入日志文件
      try {
        fs.appendFileSync(logFile, logMessage + '\n');
      } catch (error) {
        console.error('写入日志文件失败:', error.message);
      }
    }
    
    // 显示统计信息（增强评论互动模式）
    function showStats() {
      log('\n=== 运行统计（增强评论互动模式） ===');
      log(`总处理视频数: ${stats.total}`);
      log(`点赞情况: 成功 ${stats.likeSuccess} | 失败 ${stats.likeFailed} | 跳过 ${stats.likeSkipped}`);
      log(`实际点赞率: ${stats.total > 0 ? ((stats.likeSuccess / stats.total) * 100).toFixed(1) : 0}% (${stats.likeSuccess}/${stats.total})`);
      log(`评论互动会话: ${stats.commentSessions} 次`);
      log(`评论点赞总数: ${stats.totalCommentsLiked} 个`);
      log(`评论互动成功率: ${stats.commentSessions > 0 ? ((stats.commentInteractSuccess / stats.commentSessions) * 100).toFixed(1) : 0}% (${stats.commentInteractSuccess}/${stats.commentSessions})`);
      log(`下一个视频成功率: ${stats.total > 0 ? ((stats.nextSuccess / stats.total) * 100).toFixed(1) : 0}% (${stats.nextSuccess}/${stats.total})`);
      
      // 添加去重统计信息
      if (stats.totalCommentsLiked > 0) {
        const avgCommentsPerSession = stats.commentSessions > 0 ? (stats.totalCommentsLiked / stats.commentSessions).toFixed(1) : 0;
        log(`平均每次会话点赞评论: ${avgCommentsPerSession} 个`);
      }
      
      log('========================\n');
    }
    // 处理视频（增强评论互动模式）
    async function processVideo() {
      const startTime = Date.now();
      let likeSuccess = false;
      let commentInteractSuccess = false;
      let nextSuccess = false;
      let commentsLikedInSession = 0;
      
      // 更新总数统计
      stats.total++;
      
      try {
        log('\n=== 开始处理新视频 ===');
        log(`开始时间: ${new Date().toLocaleTimeString()}`);
        log(`当前是第 ${stats.total} 个视频`);
        
        // 步骤1: 随机等待6-12秒，模拟用户观看时间
        const watchTime = Math.random() * 6000 + 6000; // 6-12秒随机观看时间
        log(`开始观看视频，持续 ${(watchTime / 1000).toFixed(1)}秒...`);
        await new Promise(resolve => setTimeout(resolve, watchTime));
        
        // 步骤2: 简化的随机点赞决策
        const likeDecision = generateLikeDecision();
        
        if (likeDecision.shouldLike) {
          log(`决定点赞（概率: ${(likeDecision.probability * 100).toFixed(1)}%）`);
          likeSuccess = await likeVideo(page, 3); // 最多尝试3次
          
          // 更新点赞统计
          if (likeSuccess) {
            stats.likeSuccess++;
            log('点赞成功');
          } else {
            stats.likeFailed++;
            log('点赞失败');
          }
        } else {
          log(`跳过点赞（概率: ${(likeDecision.probability * 100).toFixed(1)}%）`);
          stats.likeSkipped++; // 记录为跳过
        }
        
        // 步骤3: 执行增强的评论互动流程（3-5分钟）
        log('准备执行增强评论互动流程（3-5分钟持续操作）...');
        stats.commentSessions++;
        
        commentInteractSuccess = await interactWithComments(page, 1); // 只尝试1次，成功后直接继续
        
        // 更新评论互动统计
        if (commentInteractSuccess) {
          stats.commentInteractSuccess++;
          // 注意：实际的评论点赞数会在interactWithComments函数内部更新
          log('评论互动成功');
        } else {
          stats.commentInteractFailed++;
          log('评论互动失败，继续处理下一个视频');
          
          // 评论互动失败时直接切换到下一个视频
          log('准备切换到下一个视频...');
          nextSuccess = await nextVideo(page, 2); // 最多尝试2次
          
          // 更新下一个视频统计
          if (nextSuccess) {
            stats.nextSuccess++;
          } else {
            stats.nextFailed++;
          }
          
          const endTime = Date.now();
          const duration = (endTime - startTime) / 1000;
          
          log('=== 当前视频处理完成 ===');
          log(`处理结果 - 观看: ${(watchTime / 1000).toFixed(1)}秒, 点赞: ${likeSuccess ? '成功' : '失败'}, 评论互动: ${commentInteractSuccess ? '成功' : '失败'}, 下一个: ${nextSuccess ? '成功' : '失败'}`);
          log(`处理耗时: ${duration}秒`);
          
          // 每处理10个视频显示一次统计
          if (stats.total % 10 === 0) {
            showStats();
          }
          
          // 直接返回，继续下一个循环
          return;
        }
        
        // 步骤4: 切换到下一个视频
        log('准备切换到下一个视频...');
        nextSuccess = await nextVideo(page, 2); // 最多尝试2次
        
        // 更新下一个视频统计
        if (nextSuccess) {
          stats.nextSuccess++;
        } else {
          stats.nextFailed++;
        }
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        log('=== 当前视频处理完成 ===');
        log(`处理结果 - 观看: ${(watchTime / 1000).toFixed(1)}秒, 点赞: ${likeSuccess ? '成功' : '失败'}, 评论互动: ${commentInteractSuccess ? '成功' : '失败'}, 下一个: ${nextSuccess ? '成功' : '失败'}`);
        log(`处理耗时: ${duration}秒`);
        
        // 每处理10个视频显示一次统计
        if (stats.total % 10 === 0) {
          showStats();
        }
        
      } catch (error) {
        log(`处理视频时发生错误: ${error.message}`);
        log('尝试切换到下一个视频...');
        
        // 更新失败统计
        if (!likeSuccess) stats.likeFailed++;
        
        // 即使出错也尝试切换到下一个视频
        try {
          nextSuccess = await nextVideo(page, 2); // 最多尝试2次
          if (nextSuccess) {
            stats.nextSuccess++;
          } else {
            stats.nextFailed++;
          }
        } catch (nextError) {
          log(`切换到下一个视频也失败了: ${nextError.message}`);
          stats.nextFailed++;
        }
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        log(`异常处理耗时: ${duration}秒\n`);
      }
    }

    // 启动主循环（基于键盘事件的新流程）
    log('开始执行视频自动化处理');
    
    // 添加键盘事件监听，允许手动触发评论互动
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (key) => {
      // Ctrl+C 退出
      if (key === '\u0003') {
        log('\n检测到 Ctrl+C，正在退出...');
        process.emit('SIGINT');
        return;
      }
      
      // 'i' 键触发评论互动
      if (key === 'i' || key === 'I') {
        log('\n检测到 i 键，手动触发评论互动功能...');
        try {
          const success = await interactWithComments(page, 1); // 手动触发也只尝试1次
          if (success) {
            log('手动评论互动执行成功');
          } else {
            log('手动评论互动执行失败');
          }
        } catch (error) {
          log(`手动评论互动出错: ${error.message}`);
        }
      }
      
      // 'h' 键显示帮助
      if (key === 'h' || key === 'H') {
        log('\n=== 键盘快捷键帮助 ===');
        log('i/I - 手动触发评论互动功能');
        log('h/H - 显示此帮助信息');
        log('Ctrl+C - 安全退出程序');
        log('====================');
      }
    });
    
    log('键盘事件监听已启动');
    log('按 i 键手动触发评论互动，按 h 键显示帮助，按 Ctrl+C 退出');
    
    // 使用无限循环实现持续运行
    async function runMainLoop() {
      while (true) {
        try {
          await processVideo();
          
          // 在循环之间添加短暂的随机延迟，避免过于频繁
          const loopDelay = Math.random() * 2000 + 1000; // 1-3秒随机延迟
          log(`等待 ${(loopDelay / 1000).toFixed(1)} 秒后开始处理下一个视频...`);
          await new Promise(resolve => setTimeout(resolve, loopDelay));
          
        } catch (loopError) {
          log(`主循环发生错误: ${loopError.message}`);
          log('等待5秒后重试...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    // 启动主循环
    runMainLoop();

    // 添加优雅退出处理（适配新的循环模式）
    process.on('SIGINT', async () => {
      log('\n正在关闭浏览器...');
      
      // 显示最终统计
      log('\n程序即将退出，最终统计:');
      showStats();
      
      await browser.close();
      log('浏览器已关闭');
      process.exit(0);
    });

  } catch (error) {
    log('程序执行出错:' + error.message);
    log('\n错误提示：');
    log('1. 请确认没有其他Chrome浏览器实例正在运行');
    log('2. 确认Chrome安装路径正确: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
    log('3. 检查用户数据目录是否存在: ./chrome-user-data');
    log('4. 尝试以管理员身份运行命令行');
    log('5. 如果页面仍然空白，可能是网络问题或网站反爬虫机制');
    log('6. 尝试清除浏览器缓存或使用不同的网络环境');
  }
})();
