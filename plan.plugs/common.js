var Store = Store||{
	get:function(key){
		return JSON.parse(localStorage.getItem(key));
	},
	
	set:function(key, value){
		localStorage.setItem(key, JSON.stringify(value));
	},
	remove:function(key){
		localStorage.removeItem(key);
	},
	schemes:{
		get:function(key){
			var schemes = Store.get("schemes") || {};
			for (var i in schemes) {
				if(key == i)
					return schemes[i];
			}
			return null;
		},
		set:function(key, value){
			var schemes = Store.get("schemes") || {};
			schemes[key] = value;
			Store.set("schemes", schemes);
		},
		remove:function(key){
			var schemes = Store.get("schemes") || {};
			delete schemes[key];
			Store.set("schemes", schemes);
		},
		getAll:function(){
			return Store.get("schemes");
		}
	}
	
}

//桌面提醒
function notify(title, properties, timeout) {
        
    if(!title){
        title = "桌面提醒";
    }
    
    var iconUrl = "icon/icon.png";
    var p = {
		title:title,
		icon:"icon/icon.png",
		requireInteraction:false
    };
	$.extend(true, p, properties);
    
    if("Notification" in window){
        // 判断是否有权限
        if (Notification.permission === "granted") {
			var notification = new Notification(title, p);
			if(timeout){
				setTimeout(() => {
					notification.close();
				}, timeout);
			}
            return notification;
        }
        //如果没权限，则请求权限
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function(permission) {
                // Whatever the user answers, we make sure we store the
                // information
                if (!('permission' in Notification)) {
                    Notification.permission = permission;
                }
                //如果接受请求
                if (permission === "granted") {
					var notification = new Notification(title, p);
					if(timeout){
						setTimeout(() => {
							notification.close();
						}, timeout);
					}
                    return notification;
                }
            });
        }
	}
}

/*

ListView - jQuery List Plugin
-----------------------------------------------

*/

(function($) {
	function ListView(target, option) {
		this.options = option;
		this.container = $(target);
		this.listHeard = null;
		this.listBody = null;
		this.parent = null;
		this.init();
	};
	
	ListView.prototype.filter = function(keyword){
		this.setData(this.options.filter(keyword, this.options.dataResult), true);
		$.each(this.listHeard.find(":checkbox"),function(){
			this.checked = false;
		});
	};
	
	ListView.prototype.setData = function(dataResult) {
		var $this = this;
		$this.listBody.find("*").remove();

		if(dataResult && dataResult.length > 0){
			for (var key = 0; key < dataResult.length; key++) {
				var result = dataResult[key];
				if(!result)
					continue;
				result["indexKey"] = key;
				$this.listBody.append($this.options.eachItem($this, result));
				if($this.options.spacing > 0){
					$this.listBody.append("<tr><td colspan='"+$this.options.module.length+"' height='"+$this.options.spacing+"' style='padding:0px;background-color:transparent;border:none;'></td></tr>");
				}
			}
		}else{
			$this.listBody.html($this.options.defaultView($this));
		}
		$this.hideLoading();
		$this.options.dataResult = dataResult;
		$this.options.setDateAfter($this, dataResult);
	};
	
	ListView.prototype.addItems = function(results){
		this.listBody.find("table.listDefault").hide();
		this.listBody.find("table.listBody").show();
		for (var key = 0; key < results.length; key++) {
			var result = results[key];
			if(!result)
				continue;
			result["indexKey"] = this.options.dataResult.push(result) - 1;
			this.listBody.append(this.options.eachItem(this, result));
		}
		if(this.options.scroll)
			this.checkScroll();
	};
	
	ListView.prototype.delItems = function(results){
		for (var i = 0; i < results.length; i++) {
			this.delItem(resultsp[i]);
		}
		this.setData(this.options.dataResult);
	};
	
	//item {key:"..",value:""}
	ListView.prototype.delItem = function(item){
		for (var i = 0; i < this.options.dataResult.length; i++) {
			var el = this.options.dataResult[i];
			if(el[item.key] == item.value){
				this.options.dataResult.splice(i, 1);
				return;
			}
		}
	};
	
	ListView.prototype.loading = function(){
		this.container.proAlert("show");
	};
	ListView.prototype.hideLoading = function(){
		this.container.proAlert("hide");
	};
	
	ListView.prototype.setHeight = function(height) {
		this.container.height(height);
		this.listBody.height(height - 38);
		this.checkScroll();
	};
	
	ListView.prototype.checkScroll = function(){
		if(this.options.scroll)
			this.listBody.mCustomScrollbar("update");
	};
	
	ListView.prototype.scrollTo = function(position){
		if(this.options.scroll)
			this.listBody.mCustomScrollbar("scrollTo", position);
	};
	
	ListView.prototype.init = function() {
		this.parent = this.options.parent;
		this.list = $("<table class='table "+ this.options.style+"'/>");
		this.listHeard = $("<thead class='"+this.options.headerStyle+"'></thead>");
		var listHeard = "<tr>";
		for (var key = 0; key < this.options.module.length; key++) {
			var result = this.options.module[key];
			listHeard += "<td name ='"+key+"' width='"+result.width +"' class='"+result.style+"'>"+result.name+"</td>";
		}
		listHeard += "</tr>";
		this.listHeard.html(listHeard).find("td").bind("click", this, this.options.onHeardClick);
		
		this.listBody = $("<tbody></tbody>");
		this.container.proAlert({icon:"fa-spinner fa-spin",modal:true});
		this.list.append(this.options.showHeader?this.listHeard:"").append(this.listBody);
		
		this.container.addClass("listview").append(this.list);
		this.setData(this.options.dataResult);
	};

	ListView.defaultOption = {
		parent:null,
		spacing:0,
		height:"auto",
		style:"baseTable",
		maxHeight:"auto",
		no_data_content:"没有相关数据",
		scroll:true,
		module:[],
		filter:function(keyword, dataResult){return dataResult;},
		showHeader:true,
		headerStyle:"",
		onHeardClick:function(ui, event){},
		setDateAfter:function(ui, dataResult){},
		eachItem:function(ui, result){
			var item = "<tr id='"+ result.contactId+"' class='"+(result.indexKey%2==0?"gray":"white")+"'>";
			for (var key = 0; key < ui.options.module.length; key++) {
				var m =  ui.options.module[key];
				item += "<td name ='"+m.key+"' width='"+m.width +"'>"+(m.handler?m.handler(result[m.key], result.indexKey):result[m.key])+"</td>";
			}
			item += "</tr>";
			return item;
		},
		defaultView:function(ui){
			return "<tr><td colspan='"+ui.options.module.length+"' class='text-center''>"+ui.options.no_data_content+"</td></tr>";
		},
		dataResult:[]
	};
	
	$.fn.listview = function(option, param) {
		
		return this.each(function() {
			var $this   = $(this);
			var data    = $this.data('crap.listview');
			var options = typeof option == 'object' && option;
			
			options = $.extend(true, {}, ListView.defaultOption, $this.data(), options);
			
			if (!data) $this.data('crap.listview', (data = new ListView(this, options)));
			if (typeof option == 'string') data[option](param);
		});
	};
	$.fn.listview.Constructor = ListView;
})(jQuery);


/*

ProgressAlert - jQuery Alert Plugin
-----------------------------------------------

*/

(function($) {
	function ProgressAlert(target, option) {
		this.el = $(target);
	    this.options  = option;
		this.init();
	};

	var icon = {
		primary:"fa-question-circle",
		info:"fa-info-circle",
		success:"fa-check-circle",
		warning:"fa-warning",
		danger:"fa-exclamation-circle"
	};
	ProgressAlert.prototype.init = function(){
		this.alert = $("<div class='alert alert-"+this.options.alert+" proAlert' style='"+this.options.style+"'>"+
				"<i class='fas "+(!this.options.icon?icon[this.options.alert]:this.options.icon)+" fa-lg'></i> "+ this.options.msg +
			"</div>");
		
		var container = this.options.container?$(this.options.container):this.el;
		container.append(this.alert).css("position","relative");
		
		if(this.options.modal){
			this.modal = $("<div class='alertModal'/>");
			container.append(this.modal);
		}
		if(this.options.delay != 0){
			this.show();
			this.destroy();
		}
	};
	
	ProgressAlert.prototype.show = function(){
//		var pos = {top: this.el.offset().top + this.el[0].offsetHeight/ 2 - parseInt(this.alert.css("height")) / 2,   left: this.el.offset().left + this.el[0].offsetWidth / 2 - parseInt(this.alert.css("width")) / 2  };
		var pos = {top: this.el.height()/ 2 - parseInt(this.alert.css("height")) / 2, left: this.el.width() / 2 - parseInt(this.alert.css("width")) / 2};
		this.alert.css({top:pos.top,left:pos.left}).show();
		if(this.options.modal){
//			this.modal.height(this.el.height()).width(this.el.width()).css({top:this.el.offset().top,left:this.el.offset().left}).show();
			this.modal.height(this.el.height()).width(this.el.width()).css({top:0,left:0}).show();
		}
	};
	
	ProgressAlert.prototype.destroy = function(){
		var $this = this;
		this.alert.fadeOut(this.options.delay,function(){
			$(this).remove();
			$this.el.removeData('crap.proAlert');
		});
		if(this.options.modal){
			this.modal.fadeOut(this.options.delay,function(){
				$(this).remove();
				$this.el.removeData('crap.proAlert');
			});
		}
	};
	
	ProgressAlert.prototype.hide = function(){
		this.alert.hide();
		if(this.options.modal){
			this.modal.hide();
		}
	};

	$.fn.proAlert = function(option) {
		ProgressAlert.defaultOption = {
			alert:"info",
			container:null,
			icon:"",
			modal:false,
			delay:0,
			msg:"",
			style:""
		};
		
		return this.each(function() {
			var $this   = $(this);
			var data    = $this.data('crap.proAlert');
			var options = typeof option == 'object' && option;
			
			options = $.extend(true, {}, ProgressAlert.defaultOption, $this.data(), options);
			
			if (!data) $this.data('crap.proAlert', (data = new ProgressAlert(this, options)));
			if (typeof option == 'string') data[option]();
		});
	};
})(jQuery);


(function ($) {
	$.fn.serializeJson=function(includeEmpty){  
	    var json={};
	    $(this.serializeArray()).each(function(){
	    	if(includeEmpty || (this.value && this.value != ""))
	    		json[this.name]=this.value;
	    });
	    return json;
	};
	
	$.fn.fillForm = function(jsonValue) {
	    var obj=this;
	    $.each(jsonValue, function (name, ival) {
	    	var $oinput = obj.find(":input[name=" + name + "]"); 
	    	if ($oinput.attr("type")== "radio" || $oinput.attr("type")== "checkbox"){
				$oinput.prop("checked", false);
	    		 $oinput.each(function(){
	                 if(Object.prototype.toString.apply(ival) == '[object Array]'){//是复选框，并且是数组
	                      for(var i=0;i<ival.length;i++){
	                          if($(this).val()==ival[i])
	                             $(this).prop("checked", true);
	                      }
	    	 		 }else{
	                     if($(this).val()==ival)
	                        $(this).prop("checked", true);
	                 }
	             });
	    	}else if($oinput.attr("type")== "textarea"){//多行文本框
	    		obj.find("[name="+name+"]").html(ival).change();
	    	}else{
	             obj.find("[name="+name+"]").val(ival).change(); 
	        }
	   });
	};
})(jQuery);


Date.prototype.format = function (format) {
	var date = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
		"H+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		"S+": this.getMilliseconds()
	};
	if (/(y+)/i.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
	}
	for (var k in date) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1
				? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
		}
	}
	return format;
};