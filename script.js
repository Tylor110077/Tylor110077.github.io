class Record {
    constructor(eventDescription, eventCategory = '默认', startTime, endTime = null) {
        this.eventDescription = eventDescription;
        this.eventCategory = eventCategory; // 新增事件类别属性
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // 计算事件耗时
    getDuration() {
        if (!this.endTime) return null; // 如果没有结束时间，返回null
        const start = new Date(this.startTime);
        const end = new Date(this.endTime);
        const duration = end - start; // 计算耗时（毫秒）
        const seconds = Math.floor((duration / 1000) % 60);
        const minutes = Math.floor((duration / 1000 / 60) % 60);
        const hours = Math.floor((duration / 1000 / 60 / 60) % 24);
        return `${hours}小时 ${minutes}分钟 ${seconds}秒`;
    }
}

class EventManager {
    constructor() {
        this.eventActive = false;
        this.currentEventName = ''; // 用于存储当前事件名称
        this.records = this.loadRecords(); // 从localStorage加载记录
        this.checkActiveEvent(); // 检查是否有未结束的事件
        this.filterTodayRecords(); // 自动筛选并展示当天事件
    }

    checkActiveEvent() {
        const activeRecord = this.records.find(record => !record.endTime); // 查找未结束的事件
        if (activeRecord) {
            this.eventActive = true; // 设置事件为活动状态
            this.currentEventName = activeRecord.eventDescription; // 保存当前事件名称
            document.getElementById('eventButton').textContent = '结束事件'; // 更新按钮文本
            document.getElementById('eventName').disabled = true; // 禁用输入框
            document.getElementById('eventCategory').disabled = true; // 禁用事件类别输入框
        }
    }

    loadRecords() {
        const records = localStorage.getItem('eventRecords');
        return records ? JSON.parse(records).map(record => new Record(record.eventDescription, record.eventCategory, record.startTime, record.endTime)) : []; // 确保每个记录都是 Record 实例
    }

    saveRecords() {
        localStorage.setItem('eventRecords', JSON.stringify(this.records)); // 将记录保存到localStorage
    }

    toggleEvent() {
        const eventName = document.getElementById('eventName').value.trim();
        const eventCategory = document.getElementById('eventCategory').value.trim(); // 获取事件类别

        console.log(`Event Name: ${eventName}, Event Category: ${eventCategory}`); // 调试信息

        if (this.eventActive) {
            this.endEvent(); // 结束当前事件
        } else {
            if (!eventName) {
                alert("请输入事件名称！");
                return;
            }
            this.startEvent(eventName); // 开始新事件
        }
        this.displayRecords();
    }

    startEvent(eventName) {
        const eventCategory = document.getElementById('eventCategory').value.trim() || '默认'; // 获取事件类别，默认为'默认'
        
        // 检查是否已经存在同名事件
        const existingRecordIndex = this.records.findIndex(record => record.eventDescription === eventName && !record.endTime);
        if (existingRecordIndex !== -1) {
            // 如果事件已经开始，更新开始时间
            this.records[existingRecordIndex].startTime = this.getCurrentTime();
        } else {
            // 否则，添加新事件
            this.records.push(new Record(eventName, eventCategory, this.getCurrentTime())); // 传递事件类别
        }
        this.eventActive = true;
        this.currentEventName = eventName; // 保存当前事件名称
        document.getElementById('eventName').value = ''; // 清空输入框
        document.getElementById('eventCategory').value = ''; // 清空事件类别输入框
        document.getElementById('eventName').disabled = true; // 禁用输入框
        document.getElementById('eventButton').textContent = '结束事件'; // 更新按钮文本

        this.saveRecords(); // 保存记录到localStorage
        this.displayRecords(); // 更新显示记录
    }

    endEvent() {
        // 更新结束时间
        const existingRecordIndex = this.records.findIndex(record => record.eventDescription === this.currentEventName && !record.endTime);
        if (existingRecordIndex !== -1) {
            this.records[existingRecordIndex].endTime = this.getCurrentTime(); // 更新结束时间
        }
        this.eventActive = false;
        document.getElementById('eventName').disabled = false; // 启用输入框
        document.getElementById('eventCategory').disabled = false; // 启用事件类别输入框
        document.getElementById('eventButton').textContent = '开始事件'; // 更新按钮文本

        // 更新记录
        this.displayRecords(); // 重新显示记录
        this.saveRecords(); // 保存记录到localStorage
    }

    getCurrentTime() {
        return new Date().toLocaleString();
    }

    displayRecords() {
        const recordsDiv = document.getElementById('records');
        recordsDiv.innerHTML = '';

        // 检查是否有记录
        if (this.records.length === 0) {
            const noRecordsMessage = document.createElement('div');
            noRecordsMessage.className = 'no-records-message'; // 使用新样式类
            noRecordsMessage.textContent = '当前没有任何事件数据'; // 提示信息
            recordsDiv.appendChild(noRecordsMessage);
            return; // 如果没有记录，直接返回
        }

        this.records.forEach(record => {
            const recordElement = document.createElement('div');
            recordElement.className = 'record-item'; // 添加样式类

            // 创建记录标题
            const headerElement = document.createElement('div');
            headerElement.className = 'record-header';
            headerElement.textContent = `${record.eventDescription}`; // 显示事件名称

            // 创建记录详细信息
            const detailsElement = document.createElement('div');
            detailsElement.className = 'record-details';

            // 创建开始时间块
            const timeElement = document.createElement('div');
            timeElement.className = 'time-block'; // 添加类以便于样式
            timeElement.textContent = `开始时间: ${new Date(record.startTime).toLocaleString()}`; // 显示开始时间
            detailsElement.appendChild(timeElement); // 将开始时间添加到详细信息中

            // 创建结束时间块
            const endTimeElement = document.createElement('div');
            endTimeElement.className = 'end-time-block'; // 添加类以便于样式
            endTimeElement.textContent = `结束时间: ${record.endTime ? new Date(record.endTime).toLocaleString() : '进行中'}`; // 显示结束时间
            detailsElement.appendChild(endTimeElement); // 将结束时间添加到详细信息中

            // 创建耗时信息
            const durationElement = document.createElement('div');
            durationElement.className = 'record-duration';
            durationElement.textContent = record.endTime ? `耗时: ${record.getDuration()}` : '';

            // 创建删除按钮
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '删除';
            deleteButton.className = 'delete-button'; // 使用通用样式类
            deleteButton.onclick = () => {
                this.deleteRecord(record.eventDescription, record.startTime); // 绑定删除事件，传递事件描述和开始时间
            };

            // 将所有元素添加到记录元素中
            recordElement.appendChild(headerElement);
            recordElement.appendChild(detailsElement);
            recordElement.appendChild(durationElement); // 添加耗时信息
            recordElement.appendChild(deleteButton); // 添加删除按钮

            recordsDiv.appendChild(recordElement);
        });
    }

    filterRecords() {
        const filterDate = document.getElementById('filterDate').value; // 获取选择的日期
        const recordsDiv = document.getElementById('records');
        recordsDiv.innerHTML = ''; // 清空记录区域

        // 如果没有选择日期，显示所有记录
        if (!filterDate) {
            this.displayRecords();
            return;
        }

        // 筛选记录
        const filteredRecords = this.records.filter(record => {
            const recordDate = new Date(record.startTime).toISOString().split('T')[0]; // 获取记录的日期
            return recordDate === filterDate; // 比较日期
        });

        // 显示筛选后的记录
        if (filteredRecords.length === 0) {
            const noRecordsMessage = document.createElement('div');
            noRecordsMessage.className = 'no-records-message'; // 使用新样式类
            noRecordsMessage.textContent = `指定日期 ${filterDate} 没有事件记录`; // 去掉句号
            recordsDiv.appendChild(noRecordsMessage);
        } else {
            filteredRecords.forEach(record => {
                const recordElement = document.createElement('div');
                recordElement.className = 'record-item'; // 添加样式类

                // 创建记录标题
                const headerElement = document.createElement('div');
                headerElement.className = 'record-header';
                headerElement.textContent = `${record.eventDescription} (${record.eventCategory})`; // 显示事件类别

                // 创建记录详细信息
                const detailsElement = document.createElement('div');
                detailsElement.className = 'time-block';
                detailsElement.textContent = `开始时间: ${record.startTime}`;

                const detailsElement1 = document.createElement('div');
                detailsElement1.className = 'end-time-block';
                detailsElement1.textContent = `结束时间: ${record.endTime ? record.endTime : '进行中'}`;

                // 创建耗时信息
                const durationElement = document.createElement('div');
                durationElement.className = 'record-duration';
                durationElement.textContent = record.endTime ? `耗时: ${record.getDuration()}` : '';

                // 创建删除按钮
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '删除';
                deleteButton.className = 'delete-button'; // 使用通用样式类
                deleteButton.onclick = () => {
                    this.deleteRecord(record.eventDescription, record.startTime); // 绑定删除事件，传递事件描述和开始时间
                };

                // 将所有元素添加到记录元素中
                recordElement.appendChild(headerElement);
                recordElement.appendChild(detailsElement);
                recordElement.appendChild(detailsElement1);
                recordElement.appendChild(durationElement);
                recordElement.appendChild(deleteButton); // 添加删除按钮

                recordsDiv.appendChild(recordElement);
            });
        }
    }

    filterTodayRecords() {
        const today = new Date().toISOString().split('T')[0]; // 获取今天的日期
        document.getElementById('filterDate').value = today; // 设置日期选择器为今天
        this.filterRecords(); // 自动筛选今天的记录
    }

    deleteRecord(eventDescription, startTime) {
        this.records = this.records.filter(record => {
            return !(record.eventDescription === eventDescription && record.startTime === startTime);
        }); // 只过滤掉指定的记录
        this.saveRecords(); // 保存更新后的记录
        this.displayRecords(); // 更新显示记录
    }
}

// 在页面加载时，初始化事件管理器
const eventManager = new EventManager();
document.getElementById('eventButton').addEventListener('click', () => {
    eventManager.toggleEvent();
});
