# eyetracker
A Chrome browser plug-in, can be used to track the behavior of browser users, can be used for outdoor advertising, advertising machine customer analysis.

Functions:

1. Collect exposure and click data
2. Set the target element of the page to count the exposure and click data of the target element
3. Analyze the user's gender and age (based on the face interface of Tencent Youtu laboratory)
4. Click on the heat map
5. Support eye movement model to collect data

# eyetracker

一个chrome浏览器插件，可以用于跟踪浏览器使用者的行为，可以用于户外广告，广告机的客户分析。

功能：

1、收集曝光、点击数据
2、设置页面target元素，可以统计target元素的曝光与点击数据
3、分析用户的性别、年龄（基于腾讯优图实验室的人脸接口）
4、支持点击热图
5、支持眼动模型收集数据

Example:



1. Create an eye movement model, click setting - > get eye movement training data start to get the training data. After creation, look at the red dots on the mask in turn and click. After clicking nine dots, stop can complete the eye movement data collection, open eye movement to open the eye movement, and you can get the DOM content of the current eye movement by editing the data

Thank you: eye movement algorithm provided by webgazer https://webgazer.cs.brown.edu

![eye movement training data collection](https://github.com/yiptsangkin/eyetracker/blob/master/image/eye_5.png?raw=true)

2. Set the target. By adding the target in setting (through DOM selector), you can get the user's click data and exposure data on the target. After adding the target, you can turn on the show target border switch in setting to see the target DOM being traced.

![target border](https://github.com/yiptsangkin/eyetracker/blob/master/image/eye_2.png?raw=true)

3. Face recognition: after the eve movement switch is turned on, the face will be recognized and the basic data (age, gender) of the user will be obtained through Tencent's excellent graph interface

![homepage](https://github.com/yiptsangkin/eyetracker/blob/master/image/eye_3.png?raw=true)

![setting](https://github.com/yiptsangkin/eyetracker/blob/master/image/eye_4.png?raw=true)

4. Click the heat map and turn on the heat map switch to screen the heat map of people of different genders and ages.

![heatmap](https://github.com/yiptsangkin/eyetracker/blob/master/image/eye_1.png?raw=true)

例子：

1、创建眼动模型，点击setting -> get eye movement training data 的start来获取训练数据，创建后依次注视遮罩上的红点并点击，点击完九个点后 stop即可完成眼动数据收集，打开Eye Movement就可以打开眼动，通过编辑数据可以获取当前眼动注视的DOM内容
感谢：眼动算法由webgazer https://webgazer.cs.brown.edu提供

![眼动训练数据收集](https://github.com/yiptsangkin/eyetracker/blob/master/image/eye_5.png?raw=true)

2、设置target，通过在setting 增加target(通过dom选择器)可以获取用户在target上的点击数据和曝光数据，增加完target可以在setting里面打开show target border开关，可以看到target dom被描边。

![target边框](https://github.com/yiptsangkin/eyetracker/blob/master/image/eye_2.png?raw=true)

3、人脸识别，打开了eve movement开关之后，人脸会进行识别并且通过腾讯的优图接口获取用户的基本数据（年龄段，性别）

![首页]](https://github.com/yiptsangkin/eyetracker/blob/master/image/eye_3.png?raw=true)

![setting](https://github.com/yiptsangkin/eyetracker/blob/master/image/eye_4.png?raw=true)

4、点击热力图，打开热力图开关后，可以筛选出不同性别，不同年龄的人的点击热力图。

![热力图](https://github.com/yiptsangkin/eyetracker/blob/master/image/eye_1.png?raw=true)




