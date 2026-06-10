cmake_minimum_required(VERSION 3.10)
project(websoketa-servillo)

set(CMAKE_CXX_STANDARD 17)

# Знаходимо Boost
find_package(Boost REQUIRED COMPONENTS system thread)

# Включаємо директорії hiredis та redis++
include_directories(/usr/include/hiredis /usr/local/include)

# Лінкуємо бібліотеки
link_directories(/usr/local/lib)

add_executable(websoketa-servillo ĉefa.cpp)

target_link_libraries(websoketa-servillo
    Boost::system
    Boost::thread
    hiredis
    redis++
)

