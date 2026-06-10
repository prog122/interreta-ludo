#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio.hpp>
#include <iostream>
#include <set>
#include <deque>
#include <memory>
#include <functional>
#include <sw/redis++/redis++.h>
#include <csignal>

using namespace sw::redis;

Redis* redis = nullptr;

using tcp = boost::asio::ip::tcp;
namespace retinterreto = boost::beast::websocket;

// Strukturo de kliento kun vico de mesaĝoj
struct Kliento {
    std::shared_ptr<retinterreto::stream<tcp::socket>> konekto;
    std::deque<std::string> vico;
};

std::set<std::shared_ptr<Kliento>> klientoj;

// Sendado de mesaĝo al kliento kun vico
void sendi(std::shared_ptr<Kliento> kliento, const std::string& mesaĝo) {
    bool skribado = !kliento->vico.empty();
    kliento->vico.push_back(mesaĝo);

    if (!skribado) {
        kliento->konekto->text(true);
        kliento->konekto->async_write(
            boost::asio::buffer(kliento->vico.front()),
            [kliento](boost::system::error_code ec, std::size_t) mutable {
                if (!ec) {
                    kliento->vico.pop_front();
                    if (!kliento->vico.empty()) {
                        sendi(kliento, kliento->vico.front());
                    }
                } else {
                    klientoj.erase(kliento);
                }
            }
	);
    }
}

// Dissendo al ĉiuj klientoj
void dissendi(const std::string& mesaĝo) {
    for (auto& kliento : klientoj) {
        sendi(kliento, mesaĝo);
    }
}

void fari_sesion(std::shared_ptr<retinterreto::stream<tcp::socket>> konekto) {
    konekto->async_accept([konekto](boost::system::error_code ec) mutable {
        if (!ec) {
            auto kliento = std::make_shared<Kliento>();
            kliento->konekto = konekto;
            klientoj.insert(kliento);

            auto bufro = std::make_shared<boost::beast::flat_buffer>();
            auto legi_ciklon = [kliento, bufro](auto mem, boost::system::error_code ec, std::size_t) mutable {
                if (!ec) {
                    kliento->konekto->text(kliento->konekto->got_text());
                    kliento->konekto->async_write(bufro->data(), [](auto, auto){});
                    bufro->consume(bufro->size());
                    kliento->konekto->async_read(*bufro, [mem, kliento, bufro](auto ec, auto bajtoj) mutable {
                        mem(mem, ec, bajtoj);
                    });
                } else {
                    klientoj.erase(kliento);
                }
            };

            konekto->async_read(*bufro, [legi_ciklon, kliento, bufro](auto ec, auto bajtoj) mutable {
                legi_ciklon(legi_ciklon, ec, bajtoj);
            });
        }
    });
}

void signala_pritraktilo(int) {
    // std::cout << "Ricevita signalo! Dissendante mesaĝon...\n";
    auto teksto = redis->hget("pozicioj-de-ludantoj", "0");
    if (teksto) {
        dissendi(*teksto);
    }
}

int main(int argc, char* argv[]) {
    try {
        std::string redisUrl = "tcp://127.0.0.1:6379";
        pid_t pid = getpid();
        std::string pid_str = std::to_string(pid);
        std::cout << "Agordante pid de la retinterreta servilo " << pid_str << std::endl;
        redis = new Redis(redisUrl);
        redis->set("ws-pid", pid_str);

        std::signal(SIGUSR1, signala_pritraktilo);

        boost::asio::io_context ioc;

        tcp::resolver solvilo(ioc);
        auto rezultoj = solvilo.resolve("vps3.pp.ua", "8081");
        tcp::endpoint finpunkto = *rezultoj.begin();
        tcp::acceptor akceptilo(ioc, finpunkto);

        std::function<void()> fari_akcepton;
        fari_akcepton = [&]() mutable {
            akceptilo.async_accept([&](boost::system::error_code ec, tcp::socket ingo) mutable {
                if (!ec) {
                    auto konekto = std::make_shared<retinterreto::stream<tcp::socket>>(std::move(ingo));
                    fari_sesion(konekto);
                }
                fari_akcepton();
            });
        };
        fari_akcepton();

        ioc.run();
    } catch (std::exception const& e) {
        std::cerr << "Fatala eraro: " << e.what() << std::endl;
        redis->del("ws-pid");
    }
}

