var bugetControler = (function () {
    var Expense = function (id, discription, value) {
        this.id = id
        this.discription = discription
        this.value = value
    }
    var Income = function (id, discription, value) {
        this.id = id
        this.discription = discription
        this.value = value
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0,
            current: function () {
                return this.inc - this.exp
            },
            headingper: function () {
                if (this.exp == 0) {
                    return 0
                } else if (this.inc == 0) {
                    return 0
                } else {
                    return parseInt(((this.exp * 100) / this.inc).toFixed());
                }
            }
        }
    };
    return {
        addItem: function (type, discription, value) {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0;
            }
            if (type === 'exp') {
                newItem = new Expense(ID, discription, value);
            } else if (type === 'inc') {
                newItem = new Income(ID, discription, value);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        getData: function () {
            return data;
        },
        addTotal: function (currentMoney, type) {
            if (currentMoney.length != 0) {
                data.total[type] += parseInt(currentMoney)
            }
            return data.total
        },
        deleteTotal: function (currentMoney, type) {
            data.total[type] -= parseInt(currentMoney);
            return data.total
        },
        calcPer: function (totalInc, entryExp) {
            return parseInt(((entryExp * 100) / totalInc).toFixed())
        },
        deleteItem: function (type, id) {
            var ids = data.allItems[type].map(function (current) {
                return current.id;
            })
            var index = ids.indexOf(parseInt(id))
            console.log(data.total)
            if (index != -1) {
                this.deleteTotal(data.allItems[type][index].value, type);
                data.allItems[type].splice(index, 1)
            }
            return data
        }
    }

})();

var UIControler = (function () {

    var DOMStrings = {
        add_Btn: '#addBtn',
        input_type: "#type",
        input_discription: "#discription",
        input_value: "#value",
        income_list_container: '.incomeList',
        expense_list_container: '.expenseList',
        middle_body: '.middle_body',
        custom_style_middle: 'style_middle_inputes',
        incLowTitle: "#incLowTitle",
        expLowTitle: "#expLowTitle",
        LowTitle_active: 'Active',
        totalincmoney: '#totalincmoney',
        totalexpmoney: '#totalexpmoney',
        currentMoney: '#currentMoney',
        headingexpPer: "#headingexpPer",
        headerDiv: '.headerDiv',
        lower_body: '.lower_body'
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.input_type).value,
                discription: document.querySelector(DOMStrings.input_discription).value,
                value: document.querySelector(DOMStrings.input_value).value
            }
        },
        getDOMString: function () {
            return DOMStrings;
        },
        addItemInList: function (obj, type, per) {
            var html, element;

            if (type == 'exp') {
                element = DOMStrings.expense_list_container
                html = `
            <div class="expenseListItem" id="exp-${obj.id}">
                <span class="title">${obj.discription}</span><span class="money">-${obj.value}</span
                ><span class="per custom_per">${per}%</span
                ><span class="deletebtn deletebtn_expense"><i class="far fa-trash-alt"></i></span>
              </div>`
            } else if (type == 'inc') {
                element = DOMStrings.income_list_container
                html = `
            <div class="incomeListItem" id="inc-${obj.id}">
                <span class="title">${obj.discription}</span><span class="money">+${obj.value}</span
                ><span class="deletebtn deletebtn_income"><i class="far fa-trash-alt"></i></span>
              </div>`
            }
            document.querySelector(element).insertAdjacentHTML("beforeend", html);
        },
        setInputUi: function (e) {
            var type, othertype;
            type = this.getInput().type;
            if (e.type == 'change') {
                othertype = e.path[0].selectedOptions[0].getAttribute('data-other');
            } else {
                othertype = e.selectedOptions[0].getAttribute('data-other');
            }
            document.querySelectorAll(`${DOMStrings.input_type},${DOMStrings.input_value},${DOMStrings.input_discription},${DOMStrings.add_Btn},${DOMStrings.middle_body},select`).forEach(function (el) {
                el.classList.toggle(`${DOMStrings.custom_style_middle}_${type}`);
                el.classList.remove(`${DOMStrings.custom_style_middle}_${othertype}`)
            })
            document.querySelector(`${DOMStrings[`${type}LowTitle`]}`).classList.toggle(`${DOMStrings.LowTitle_active}${type}`)
            document.querySelector(`${DOMStrings[`${othertype}LowTitle`]}`).classList.remove(`${DOMStrings.LowTitle_active}${othertype}`)
        },
        clearInputes: function () {
            document.querySelectorAll(`${DOMStrings.input_value},${DOMStrings.input_discription}`).forEach(function (el) {
                el.value = '';
            })
        },
        addTotalInUi: function (totalObj) {
            document.querySelector(DOMStrings.totalincmoney).innerHTML = "+ " + totalObj['inc'];
            document.querySelector(DOMStrings.totalexpmoney).innerHTML = "- " + totalObj['exp'];
            document.querySelector(DOMStrings.currentMoney).innerHTML = ((totalObj.current() > 0) ? "+ " : "") + totalObj['current']();
            document.querySelector(DOMStrings.headingexpPer).innerHTML = totalObj['headingper']() + "%";
        },
        addTime: function (mon, year) {
            document.querySelector(DOMStrings.headerDiv).innerHTML = `<h3>Your Buget of <span id="mo">${mon} ${year}</span></h3>`
        },

        deleteItem : function (elementId) {
            var el = document.querySelector(`#${elementId}`)
            el.parentElement.removeChild(el);
        },

    }
})();

var AppControler = (function (bugetCtl, uiCtl) {

    var setupEvenListener = function () {
        var DOM = uiCtl.getDOMString();

        document.querySelector(DOM.add_Btn).addEventListener('click', ctlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctlAddItem();
            }
        });
        document.addEventListener('load', uiCtl.setInputUi(document.querySelector(DOM.input_type)))
        document.querySelector(DOM.input_type).addEventListener('change', function (e) { uiCtl.setInputUi(e) });
        document.querySelector(DOM.lower_body).addEventListener('click', deleteItem)
    }
    var setDate = function () {
        var date = new Date()
        var mon = ["January", "February", "March", "April", "May", "June", "July", "Auguest", "Septembar", "Octobar", "Novembar", "Decembar"][date.getMonth()];
        var year = date.getFullYear();
        uiCtl.addTime(mon, year);
    }
    
    var updatePer = function (){
        var data = bugetCtl.getData();
        var allIds  = [];
        var all_itemsNodeObj = document.querySelector(uiCtl.getDOMString().expense_list_container).children   
        Array.from(all_itemsNodeObj).forEach(function (el) {
            allIds.push(el.id);
        })
        allIds.forEach(function (id) {
            el = document.getElementById(id)
            el_money = Math.abs(parseInt(el.childNodes[2].innerText));
            el.childNodes[3].innerText = bugetCtl.calcPer(data.total.inc, el_money) + "%";
        })
    }


    var ctlAddItem = function () {
        var getInput = uiCtl.getInput();
        
        var new_item = bugetCtl.addItem(getInput.type, getInput.discription, getInput.value);
        var total = bugetCtl.addTotal(getInput.value, getInput.type);
        uiCtl.addItemInList(new_item, getInput.type, bugetCtl.calcPer(total.inc, parseInt(getInput.value)));
        uiCtl.clearInputes();
        uiCtl.addTotalInUi(total);
        updatePer();

    }
    var deleteItem = function (e) {
        var [type, id] = e.target.parentNode.parentNode.id.split('-');
        console.log(type, id)
        if (type != '' && id != undefined) {
            var updateData = bugetCtl.deleteItem(type, id);
            uiCtl.addTotalInUi(updateData.total);
        }
        uiCtl.deleteItem(`${type}-${id}`);
        updatePer();

    }

    return {
        init: function () {
            console.log('App Started');
            setupEvenListener();
            setDate()
        }
    }

})(bugetControler, UIControler);

AppControler.init();