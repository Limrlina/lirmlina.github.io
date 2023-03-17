<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Заказ мебели</title>
  <!-- bootstrap core css -->
  <link rel="stylesheet" type="text/css" href="../css/bootstrap.css" />

  <!-- Custom styles for this template -->
  <link href="../css/style.css" rel="stylesheet" />
  <!-- responsive style -->
  <link href="../css/responsive.css" rel="stylesheet" />
  <!-- logo style -->
  <link href="../css/logo.css" rel="stylesheet" />
  
  <link rel="stylesheet" href="style.css">
  <script src="front.js"></script>
</head>
<body>
  <!-- header section strats -->
  <header class="header_section">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-11 offset-lg-1">
              <nav class="navbar navbar-expand-lg custom_nav-container">
                <a class="navbar-brand" href="../index.html">
                  <div class="logo">
                    <div class="leftCircle"></div>
                    <div class="rightCircle"></div>
                    <div class="leftInnerCircle"></div>
                    <div class="rightInnerCircle"></div>
                    <div class="backgroundSquare"></div>
                    <div class="leftEdge"></div>
                    <div class="rightEdge"></div>
                    <div class="leftStick"></div>
                    <div class="rightStick"></div>
                    <div class="square"></div>
                  </div>
                  <span>
                    Milana Ryzhova
                  </span>
                </a>
                </a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                  aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                  <span class="navbar-toggler-icon"></span>
                </button>
  
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                  <div class="d-flex ml-auto flex-column flex-lg-row align-items-center">
                    <ul class="navbar-nav  ">
                      <li class="nav-item active">
                        <a class="nav-link" href="../index.html">Home <span class="sr-only">(current)</span></a>
                      </li>
                      <li class="nav-item">
                        <a class="nav-link" href="../about.html"> About me</a>
                      </li>
                      <li class="nav-item">
                        <a class="nav-link" href="../portfolio.html"> Portfolio </a>
                      </li>
                    </ul>
                  </div>
  
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <!-- end header section -->
  
  <div id="container">
    <h1>Заказ мебели</h1>
    <?php
      $cities = array("Москва", "Санкт-Петербург", "Пермь", "Саратов", "Вологда");
      $furniture_colours = array("Орех", "Дуб мореный", "Палисандр", "Эбеновое дерево", "Клен", "Лиственница");
      $furniture_items = array("Банкетка", "Кровать", "Комод", "Шкаф", "Стул", "Стол");
    ?>
    <form method="POST" action="wordGenerator.php" enctype="multipart/form-data" onchange="checkForm()">

      <label for="name">Фамилия:</label>
      <input type="text" name="name" id="name" required><br>

      <label for="city">Город доставки:</label>
      <select name="city" id="city" required>
          <?php
              foreach ($cities as $city) {
                  echo "<option value='$city'>$city</option>";
              }
          ?>
      </select><br>

      <label for="date">Дата доставки:</label>
      <input type="date" name="date" id="date" value="<?php echo date('Y-m-d'); ?>" required><br>

      <label for="address">Адрес:</label>
      <input type="text" name="address" id="address" required><br>

      <table>
        <tr>
          <td>
            <label>Выберите цвет мебели:</label>
            <ul>
              <?php
                foreach ($furniture_colours as $colour) {
                  echo "<li><input type='radio' name='furniture_colour' value='$colour'>$colour</li>";
                }
              ?>
            </ul>
          </td>
          <td>
            <label>Выберите предметы мебели:</label>
            <ul>
              <?php
                foreach ($furniture_items as $item) {
                  echo "<li><input type='checkbox' name='furniture_item[]' value='$item'>$item</li>";
                }
              ?>
            </ul>
          </td>
          <td>
            <label>Количество:</label>
            <ul>
              <?php
                for ($i = 0; $i < count($furniture_items); $i++) {
                  echo "<li><input type='number' name='quantity[]' value='' class='quantityField'></li>";
                }
              ?>
            </ul>
          </td>
        </tr>
      </table>

      <label for="uploaded_file" id="file-label">Загрузить прайс</label>
      <input type="file" name="uploaded_file" id="uploaded_file" onchange="showFileName()"><br>

      <button type="submit" id="submitButton" disabled>Оформить заказ</button>
    </form>
  </div>
</body>
</html>
