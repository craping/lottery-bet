function searchPlan(options){
    bgPage.Web.ajax("plan/search", {
        safe:true,
        data:{
            lottery:options.lottery,
            type:options.play,
            position:options.position,
            plan_count:options.planType,
            code_count:options.codeNum,
            count:$("#count").val(),
	        rate:0
        },
        success:data => {
            data.info.sort((a, b) => {
                return Big(b.win_rate).cmp(a.win_rate);
            });
            $("#planList").listview("setData", data.info);
        },
        fail:data => {
            $("#planList").listview("hideLoading");
            console.log("获取计划异常:"+data.mgs);
            alertWrapper("danger", data.msg);
            notify("操作提示", {body:data.msg}, 3000);
        }
    });
}
function searchHistory(key){
    bgPage.Web.ajax("plan/history", {
        data:{
            key:key,
            count:$("#count").val()
        },
        success:data => {
            $("#planPane").removeClass("show active");
            $("#recordPane").addClass("show active");
            vm.historyPlan = data.info;
            vm.$forceUpdate();
            $("#back").removeClass("d-none");
        },
        fail:data => {
            $("#planList").listview("hideLoading");
            console.log("获取计划异常:"+data.mgs);
        }
    });
}
function renderChaseType(chaseType){
    if(chaseType == 4){
        $("#customMulti").show();
        $("div[name=sysMulti]").hide();
    }else{
        $("#customMulti").hide();
        $("div[name=sysMulti]").show();
    }
}
function fillScheme(){
    $("#strategyForm").fillForm(curScheme.schemeCache.strategy);
    renderChaseType(curScheme.schemeCache.strategy.chaseType);

    $("#planForm").fillForm(curScheme.schemeCache.plan);
    searchPlan(curScheme.schemeCache.plan);
}

$(function(){
    $("#search").click(function(){
        $("#planList").listview("loading");
        searchPlan($("#planForm").serializeJson());
    });

    $("#back").click(function(){
        $("#planPane").addClass("show active");
        $("#recordPane").removeClass("show active");
        $(this).addClass("d-none");
    });
    $("#planList").listview({
        style:"baseTable table-sm table-hover tablist",
        module:[{
            name:"#",
            key:"key",
            handler:(val, i)=>{
                var plan = curScheme.schemeCache.plan;
                var checked = plan.plan==val?"checked":"";
                return '<div class="custom-control custom-checkbox">'+
                    '<input type="radio" name="plan" '+checked+' class="custom-control-input" id="'+val+'" value="'+val+'">'+
                    '<label class="custom-control-label" for="'+val+'">&nbsp;</label>'+
                '</div>';
            }
        },{
            name:"名称", key:"name", handler:(val)=>{return val.substring(val.indexOf("】")+1, val.length);}
        },{
            name:"预测期数", key:"period", handler:(val)=>{return val+"期";}
        },{
            name:"方案",
            key:"schema",
        },{
            name:"最大连中", key:"win_num"
        },{
            name:"战绩", key:"grade", handler:(val)=>{
                let grade = val.split(":");
                return grade[0]+"期中"+grade[1]+"期";
            }
        },{
            name:"胜率", key:"win_rate", handler:(val)=>{return Big(val).mul(100).toFixed(2)+"%";}
        },{
            name:"操作",
            key:"key",
            handler:(val, i)=>{
                return '<a href="#recordPane" data-key="'+val+'" class="btn btn-outline-danger btn-sm">查看</a>';
            }
        }],
        setDateAfter:(ui, dataResult) =>{
            ui.container.find("a").click(function(){
                var key = $(this).data("key");
                $(this).parent().parent().find(":radio").trigger("click");
                searchHistory(key);
            });
        }
    });

    $("#planForm").submit(function(){
        let form = $(this).serializeJson();
        if(!form.plan)
            alertWrapper("danger", "请选择计划！");
        let plan = form.plan.split("_");
        curScheme.schemeCache.plan = {
            codeNum:plan[4],
            lottery:plan[0],
            plan:form.plan,
            planType:plan[3],
            play:plan[1],
            position:plan[2]
        };
        curScheme.serialize();

        alertWrapper("success", "计划应用成功！");
        return false;
    });




    $("#odds").on("input change", function(){
        $("#odds-val").text(this.value);
        $("#odds-val1").text(Big(this.value).div(5).toString());
    });

    $("#money").on("input", function(){
        $("#profitLimit").val(Big(this.value).mul(0.1));
        $("#lossLimit").val(Big(this.value).mul(-0.1));
    });

    function renderChase(maxChase){
        var minMulti = $("#minMulti").val();
        for (let i = 1; i <= maxChase; i++) {
            var num = $("#customMulti .form-group").length +1;
            $("#customMulti").append('<div class="form-group row">'+
            '<div class="col-sm-2 offset-sm-2">'+
                '<div class="input-group input-group-sm">'+
                    '<div class="input-group-prepend">'+
                        '<span class="input-group-text">'+num+'期</span>'+
                    '</div>'+
                    '<input type="number" name="customMulti'+num+'" min="2" value="'+(minMulti)+'" step="1" class="form-control">'+
                    '<div class="input-group-append">'+
                        '<span class="input-group-text">倍</span>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>');
        }
    }


    $("#maxChase").on("input change", function() {
        var chase = $("#customMulti .form-group").length;
        if(this.value != chase) {
            if(this.value < chase){
                for (let i = 0; i < chase - this.value; i++) {
                    $("#customMulti .form-group").eq(-1).remove();
                }
            } else {
                renderChase(this.value - chase);
            }
        }
    });

    $(":input[name=chaseType]").click(function(){
        renderChaseType(this.value);
    });

    $("#strategyForm").submit(function(){
        if(curScheme.schemeCache.start){
            alertWrapper("danger", "计划正在执行");
            return false;
        }
        curScheme.schemeCache.strategy = $(this).serializeJson();
        curScheme.Account.init();

        alertWrapper("success", "应用配置成功！");
        return false;
    }).find("button[name=btn_reset]").click(function(){
        var form = $("#strategyForm");
        form[0].reset();
        form.find("input[type=range]").change();
    });
})